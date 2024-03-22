import { useCallback, useMemo, useState } from 'react';
import _ from 'lodash';
import message from '@/components/message';
import { useMessage } from '@/hooks/common/message';
import { getBackendType } from '@/utils/app/backend';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import {
    getLedgerIcpCanisterId,
    getLedgerIcpDecimals,
    getLedgerIcpFee,
} from '@/utils/canisters/ledgers/special';
import {
    createBatchBuyOrder,
    submittingTransferBatchHeight,
} from '@/utils/canisters/yuku-old/core';
import { getYukuCoreCanisterId } from '@/utils/canisters/yuku-old/special';
import {
    larkNoticeBatchBuy,
    larkNoticeBatchBuyFailed,
    larkNoticeBatchBuyInitial,
    larkNoticeBatchBuyOver,
} from '@/apis/yuku-logs/batch-buy';
import { ERRS_NOT_SEND } from '@/apis/yuku-logs/special';
import entrepot_idl from '@/canisters/entrepot/index.did';
import { SubAccount__1 } from '@/canisters/entrepot/index.did.d';
import { TokenIdentifier__1 } from '@/canisters/entrepot/index.did.d';
import { AccountIdentifier__1 } from '@/canisters/entrepot/index.did.d';
import icp_ledger_idl from '@/canisters/ledgers/ledger_icp/icp.did';
import { BatchOrderInfo } from '@/canisters/yuku-old/yuku_core';
import { hex2array } from '@/common/data/hex';
import { exponentNumber } from '@/common/data/numbers';
import { principal2account } from '@/common/ic/account';
import { parse_nft_identifier } from '@/common/nft/ext';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { throwIdentity } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import {
    BatchBuyingAction,
    BatchBuyingByTransactionExecutor,
    BatchBuyingTransaction,
    BatchBuyNftExecutor,
} from '@/types/exchange/batch-buy';
import { ConnectedIdentity } from '@/types/identity';
import { NftListing, NftListingListing } from '@/types/listing';
import { NftIdentifier } from '@/types/nft';
import { NftTokenOwner } from '@/types/nft';
import { useCheckAction } from '../../common/action';
import { useCheckIdentity } from '../../common/identity';
import { checkWhitelist } from '../../common/whitelist';
import { LedgerTransferExecutor, useTransferByICP } from '../../ledger/transfer';
import { transaction_executed, transaction_executing } from '../executing';
import useActionSteps, { MarkAction, useDoAction, useLatestAction } from '../steps';

type BATCH_LOCK_RAW = {
    idl: any;
    canisterId: string;
    methodName: 'lock';
    args: [TokenIdentifier__1, bigint, AccountIdentifier__1, SubAccount__1];
    onSuccess: (e: { ok: string }) => Promise<void>;
    onFail: (e: any) => Promise<void>;
};
type BATCH_SETTLE_RAW = {
    idl: any;
    canisterId: string;
    methodName: 'settle';
    args: [string];
    onSuccess: (e: any) => Promise<void>;
    onFail: (e: any) => Promise<void>;
};
// export type BatchBuyingAction =

//     // ? entrepot action

export const useBatchBuyingActionSteps = (
    action: BatchBuyingAction,
    is_entrepot?: boolean,
): {
    show: boolean;
    hide: () => void;
    failed: boolean;
    fail: () => void;
    title: string;
    actions: MarkAction<BatchBuyingAction>[];
} => {
    const { show, hide, failed, fail } = useActionSteps(action);

    const { title, actions }: { title: string; actions: MarkAction<BatchBuyingAction>[] } =
        useMemo(() => {
            const title = 'Buy NFT';
            const actions: MarkAction<BatchBuyingAction>[] = is_entrepot
                ? [
                      {
                          title: 'Check order status and check wallet balance',
                          actions: ['DOING', 'CHECKING_BALANCE'],
                      },
                      { title: 'Locking NFT orders', actions: ['BATCH_LOCK'] },
                      { title: 'Calling Ledger to validate transactions', actions: ['BATCH_PAY'] },
                      { title: 'Transferring NFTs', actions: ['BATCH_SETTLE'] },
                  ]
                : [
                      {
                          title: 'Check order status and check wallet balance',
                          actions: ['DOING', 'CHECKING_BALANCE', 'CREATING_BATCH_ORDER'],
                      },
                      { title: 'Calling Ledger to validate transactions', actions: ['PAY'] },
                      { title: 'Transferring NFTs', actions: ['SUBMITTING_HEIGHT'] },
                  ];
            return { title, actions };
        }, []);

    return {
        show,
        hide,
        failed,
        fail,
        title,
        actions,
    };
};

export const useBatchBuyNft = (): {
    batchBuy: BatchBuyNftExecutor;
    action: BatchBuyingAction;
} => {
    const checkIdentity = useCheckIdentity();
    const checkAction = useCheckAction();

    const [action, setAction] = useState<BatchBuyingAction>(undefined);

    const { balance, fee, decimals, transfer } = useTransferByICP();

    const batchBuy = useCallback(
        async (
            token_list: {
                owner: NftTokenOwner;
                listing: NftListing;
            }[],
        ): Promise<NftIdentifier[] | undefined> => {
            const identity = checkIdentity();
            const token_id_list = token_list.map((t) => t.owner.token_id);
            if (!checkArgs(identity, token_list)) return undefined;
            checkAction(action, `Batch purchasing`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [
                    ...token_list.map((item) => item.owner.token_id.collection),
                    ...token_list.map((item) =>
                        item.listing.type === 'listing' ? item.listing.token.canister : '',
                    ),
                ]);

                const spend = Spend.start(
                    `batch buy nft ${token_list
                        .map((o) => o.owner.token_id)
                        .map(uniqueKey)
                        .join('/')}`,
                );

                const { memo, price } = await createBatchOrder(
                    setAction,
                    identity,
                    token_list,
                    spend,
                );

                await checkBalance(setAction, balance, identity, spend, price, fee, decimals);

                const height = await doPay(setAction, transfer, price, memo, spend);

                const success_id = await submit(setAction, identity, height, spend, token_id_list);

                return success_id.map(parse_nft_identifier);
            } catch (e) {
                message.error(`Buy NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [checkIdentity, action, balance, fee, decimals, transfer],
    );

    return { batchBuy, action };
};

export const useBatchBuyNftByTransaction = (): {
    batchBuy: BatchBuyNftExecutor;
    action: BatchBuyingAction;
} => {
    const checkIdentity = useCheckIdentity();

    const message = useMessage();

    const insert = useTransactionStore((s) => s.insert);

    const [id, setId] = useState<string | undefined>(undefined);

    const batchBuy = useCallback(
        async (
            token_list: {
                owner: NftTokenOwner;
                listing: NftListing;
            }[],
        ): Promise<NftIdentifier[] | undefined> => {
            const identity = checkIdentity();
            throwIdentity(identity);
            if (!checkArgs(identity, token_list)) return undefined;

            const id = await insert(identity.principal!, {
                type: 'batch-buy',
                args: { token_list },
                actions: [],
                paid: 0,
            }).catch((e) => {
                message.error(e.message);
                return undefined;
            });
            if (!id) return undefined;
            setId(id);

            larkNoticeBatchBuyInitial(
                getBackendType(),
                id,
                identity.principal!,
                token_list.map((i) => i.owner.token_id),
                token_list
                    .map((i) => (i.listing as NftListingListing).price)
                    .reduce((a, b) => bigint2string(string2bigint(a) + string2bigint(b)), ''),
                '',
            );
            throw new Error(`already recorded transaction`);
        },
        [checkIdentity, insert],
    );
    const action = useLatestAction<BatchBuyingTransaction, BatchBuyingAction>(id);

    return { batchBuy, action };
};

export const useDoBatchBuyNftByTransaction = (): BatchBuyingByTransactionExecutor => {
    const checkIdentity = useCheckIdentity();

    const {
        balance: icpBalance,
        fee: icpFee,
        decimals: icpDecimals,
        transfer: icpTransfer,
    } = useTransferByICP(true);
    const update = useTransactionStore((s) => s.update);

    const doAction = useDoAction<BatchBuyingAction, any>();
    const doBatchBuy = useCallback(
        async (
            id: string,
            created: number,
            transaction: BatchBuyingTransaction,
            manual: boolean,
        ) => {
            const identity = checkIdentity();
            const token_list = transaction.args.token_list;
            const token_id_list = token_list.map((t) => t.owner.token_id);
            throwIdentity(identity);
            if (!checkArgs(identity, transaction.args.token_list)) return undefined;
            if (!transaction_executing(id)) return;

            const spend = Spend.start(
                `batch buy nft ${token_list
                    .map((o) => o.owner.token_id)
                    .map(uniqueKey)
                    .join('/')}`,
            );

            let done_action = false;
            const set_action_done = () => {
                done_action = true;
            };
            const setAction = () => {};
            const lark_notice_before = function (action: BatchBuyingAction): number {
                return larkNoticeBatchBuy(0, getBackendType(), id, action ?? '');
            };
            const lark_notice_after = function (
                now: number,
                action: BatchBuyingAction,
                data?: string,
            ): void {
                larkNoticeBatchBuy(
                    now,
                    getBackendType(),
                    id,
                    action ?? '',
                    data ? `${JSON.stringify(data)}` : undefined,
                );
            };

            if (
                identity.connectType === 'plug' &&
                token_list.every(
                    (l) => l.listing.type === 'listing' && l.listing.raw.type === 'entrepot',
                )
            ) {
                try {
                    await doAction('DOING', transaction, {
                        fetch_action: async () => {},
                        do_action: async () => {
                            transaction.actions.push({ action: 'DOING', timestamp: Date.now() });
                            await update(id, transaction, 'executing');
                        },
                        set_action_done,
                        spend,
                        lark_notice_before,
                        lark_notice_after,
                    });
                    if (done_action) return;

                    await doAction('BATCH_LOCK', transaction, {
                        fetch_action: async () => {},
                        do_action: async () => {
                            const raw_list: BATCH_LOCK_RAW[] = [];
                            const pay_account_list: {
                                token_identifier: string;
                                account: string;
                            }[] = [];
                            for (const l of token_list) {
                                const price = l.listing.type === 'listing' && l.listing.price;

                                price &&
                                    raw_list.push({
                                        idl: entrepot_idl,
                                        canisterId: l.owner.token_id.collection,
                                        methodName: 'lock',
                                        args: [
                                            l.owner.token_id.token_identifier,
                                            string2bigint(price),
                                            identity.account,
                                            hex2array(identity.account),
                                        ],
                                        onSuccess: async (e) => {
                                            pay_account_list.push({
                                                token_identifier: l.owner.token_id.token_identifier,
                                                account: e.ok,
                                            });
                                        },
                                        onFail: function (e): Promise<void> {
                                            throw new Error(e);
                                        },
                                    });
                            }
                            await window.ic.plug.batchTransactions(raw_list);
                            transaction.actions.push({
                                action: 'BATCH_LOCK',
                                timestamp: Date.now(),
                                data: { pay_account_list },
                            });
                            await update(id, transaction, 'executing');
                        },
                        set_action_done,
                        spend,
                        lark_notice_before,
                        lark_notice_after,
                    });
                    if (done_action) return;

                    await doAction('BATCH_PAY', transaction, {
                        fetch_action: async () => {},
                        do_action: async () => {
                            const raw_list: any[] = [];
                            const pay_account_list: {
                                token_identifier: string;
                                account: string;
                            }[] = transaction.actions.find((a) => a.action === 'BATCH_LOCK')?.data
                                .pay_account_list;
                            const paid_account_list: {
                                token_identifier: string;
                                account: string;
                                paid: boolean;
                            }[] = [];
                            for (const l of token_list) {
                                const price = l.listing.type === 'listing' && l.listing.price;
                                const find_account = pay_account_list.find(
                                    (p) => p.token_identifier === l.owner.token_id.token_identifier,
                                )?.account;
                                price &&
                                    find_account &&
                                    raw_list.push({
                                        idl: icp_ledger_idl,
                                        canisterId: getLedgerIcpCanisterId(),
                                        methodName: 'transfer',
                                        args: [
                                            {
                                                to: hex2array(find_account),
                                                fee: { e8s: string2bigint(getLedgerIcpFee()) },
                                                amount: { e8s: string2bigint(price) },
                                                memo: Math.floor(Math.random() * 33),
                                                from_subaccount: [], // For now, using default subaccount to handle ICP
                                                created_at_time: [],
                                            },
                                        ],
                                        onSuccess: async (e) => {
                                            console.debug('🚀 ~ onSuccess: ~ e:', e);
                                            paid_account_list.push({
                                                token_identifier: l.owner.token_id.token_identifier,
                                                account: find_account,
                                                paid: true,
                                            });
                                        },
                                        onFail: function (e): Promise<void> {
                                            throw new Error(e);
                                        },
                                    });
                            }
                            await window.ic.plug.batchTransactions(raw_list);
                            transaction.actions.push({
                                action: 'BATCH_PAY',
                                timestamp: Date.now(),
                                data: { paid_account_list },
                            });
                            await update(id, transaction, 'executing');
                        },
                        set_action_done,
                        spend,
                        lark_notice_before,
                        lark_notice_after,
                    });
                    if (done_action) return;

                    await doAction('BATCH_SETTLE', transaction, {
                        fetch_action: async () => {},
                        do_action: async () => {
                            const raw_list: BATCH_SETTLE_RAW[] = [];
                            const paid_account_list: {
                                token_identifier: string;
                                account: string;
                                paid: boolean;
                            }[] = transaction.actions.find((a) => a.action === 'BATCH_PAY')?.data
                                .paid_account_list;

                            const settle_account_list: {
                                token_identifier: string;
                                account: string;
                                settled: boolean;
                            }[] = [];
                            for (const l of paid_account_list) {
                                const paid = l.paid;
                                paid &&
                                    raw_list.push({
                                        idl: entrepot_idl,
                                        canisterId: parse_nft_identifier(l.token_identifier)
                                            .collection,
                                        methodName: 'settle',
                                        args: [l.token_identifier],
                                        onSuccess: async (e) => {
                                            console.debug('🚀 ~ onSuccess settle: ~ e:', e);
                                            settle_account_list.push({
                                                token_identifier: l.token_identifier,
                                                account: l.account,
                                                settled: true,
                                            });
                                        },
                                        onFail: function (e): Promise<void> {
                                            throw new Error(e);
                                        },
                                    });
                            }
                            await window.ic.plug.batchTransactions(raw_list);
                            transaction.actions.push({
                                action: 'BATCH_SETTLE',
                                timestamp: Date.now(),
                                data: { settle_account_list },
                            });
                            await update(id, transaction, 'successful');
                        },
                        set_action_done,
                        spend,
                        lark_notice_before,
                        lark_notice_after,
                    });

                    larkNoticeBatchBuyOver(
                        created,
                        getBackendType(),
                        id,
                        identity.principal!,
                        transaction.args.token_list.map((i) => i.owner.token_id),
                        exponentNumber(
                            bigint2string(
                                transaction.args.token_list
                                    .map((i) =>
                                        i.listing.type === 'listing' ? i.listing.price : '0',
                                    )
                                    .map((price) => BigInt(price))
                                    .reduce((acc, current) => acc + current, BigInt(0)),
                            ),
                            -getLedgerIcpDecimals(),
                        ),
                        `Actions: ${transaction.actions
                            .map(
                                (a) =>
                                    `${a.action}(${a.timestamp})${
                                        a.data ? `: ${JSON.stringify(a.data)}` : ''
                                    }`,
                            )
                            .join('\n\t')}`,
                    );
                } catch (e: any) {
                    const message = `${e.message ?? e}`;
                    const log_error = !ERRS_NOT_SEND.find((m) => message.indexOf(m) !== -1);

                    larkNoticeBatchBuyFailed(
                        created,
                        getBackendType(),
                        id,
                        identity.principal!,
                        transaction.args.token_list.map((i) => i.owner.token_id),
                        transaction.args.token_list
                            .map((i) => (i.listing as NftListingListing).price)
                            .reduce(
                                (a, b) => bigint2string(string2bigint(a) + string2bigint(b)),
                                '',
                            ),
                        `Actions: ${transaction.actions
                            .map(
                                (a) =>
                                    `${a.action}(${a.timestamp})${
                                        a.data ? `: ${JSON.stringify(a.data)}` : ''
                                    }`,
                            )
                            .join('\n\t')}`,
                        message,
                        log_error,
                    );

                    await update(id, transaction, 'failed', message);
                } finally {
                    transaction_executed(id);
                }
                return;
            }

            try {
                await checkWhitelist(identity, [
                    ...token_list.map((item) => item.owner.token_id.collection),
                    ...token_list.map((item) =>
                        item.listing.type === 'listing' ? item.listing.token.canister : '',
                    ),
                ]);

                await doAction('DOING', transaction, {
                    fetch_action: async () => {},
                    do_action: async () => {
                        transaction.actions.push({ action: 'DOING', timestamp: Date.now() });
                        await update(id, transaction, 'executing');
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });

                if (done_action) return;

                const { memo, price } = await doAction('CREATING_BATCH_ORDER', transaction, {
                    fetch_action: async (action) => action.data!,
                    do_action: async () => {
                        const { memo, price } = await createBatchOrder(
                            setAction,
                            identity,
                            token_list,
                            spend,
                        );
                        transaction.actions.push({
                            action: 'CREATING_BATCH_ORDER',
                            timestamp: Date.now(),
                            data: { memo, price },
                        });
                        await update(id, transaction, 'executing');
                        return { memo, price };
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });

                if (done_action) return;

                const { transfer } = await (async () => {
                    if (transaction.actions.find((a) => a.action === 'PAY'))
                        return { transfer: icpTransfer };
                    const checkedBalance = transaction.actions.find(
                        (a) => a.action === 'CHECKING_BALANCE',
                    );
                    if (checkedBalance && Date.now() < checkedBalance.timestamp + 15000) {
                        return {
                            transfer: icpTransfer,
                        };
                    }

                    await checkBalance(
                        setAction,
                        icpBalance,
                        identity,
                        spend,
                        price,
                        icpFee,
                        icpDecimals,
                    );

                    let index = -1;
                    for (let i = transaction.actions.length - 1; 0 <= i; i--) {
                        if (transaction.actions[i].action === 'CHECKING_BALANCE') {
                            index = i;
                            break;
                        }
                    }
                    if (index < 0)
                        transaction.actions.push({
                            action: 'CHECKING_BALANCE',
                            timestamp: Date.now(),
                        });
                    else
                        transaction.actions.splice(index, 0, {
                            action: 'CHECKING_BALANCE',
                            timestamp: Date.now(),
                        });
                    await update(id, transaction, 'executing');
                    return {
                        fee: icpFee,
                        transfer: icpTransfer,
                    };
                })();

                let height: string;

                if (
                    transaction.actions.find((a) => a.action === 'PAY') ||
                    transaction.paid === 0 ||
                    manual
                ) {
                    const { height: action_height } = await doAction('PAY', transaction, {
                        fetch_action: async (action) => action.data!,
                        do_action: async () => {
                            transaction.paid++;
                            await update(id, transaction, 'executing');

                            const height = await doPay(setAction, transfer, price, memo, spend);
                            if (!height) {
                                throw new Error(
                                    `Pay failed. Contact Yuku with order id: ${height}`,
                                );
                            }
                            transaction.actions.push({
                                action: 'PAY',
                                timestamp: Date.now(),
                                data: { height },
                            });
                            await update(id, transaction, 'executing');
                            return { height };
                        },
                        set_action_done,
                        spend,
                        lark_notice_before,
                        lark_notice_after,
                    });
                    height = action_height;
                } else {
                    throw new Error('auto pay is forbidden');
                }

                await doAction('SUBMITTING_HEIGHT', transaction, {
                    fetch_action: async () => {},
                    do_action: async () => {
                        const success_id = await submit(
                            setAction,
                            identity,
                            height,
                            spend,
                            token_id_list,
                        );
                        transaction.actions.push({
                            action: 'SUBMITTING_HEIGHT',
                            timestamp: Date.now(),
                            data: success_id,
                        });
                        await update(id, transaction, 'successful');
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });

                larkNoticeBatchBuyOver(
                    created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.token_list.map((i) => i.owner.token_id),
                    price,
                    `Actions: ${transaction.actions
                        .map(
                            (a) =>
                                `${a.action}(${a.timestamp})${
                                    a.data ? `: ${JSON.stringify(a.data)}` : ''
                                }`,
                        )
                        .join('\n\t')}`,
                );
            } catch (e: any) {
                const message = `${e.message ?? e}`;
                const log_error = !ERRS_NOT_SEND.find((m) => message.indexOf(m) !== -1);

                larkNoticeBatchBuyFailed(
                    created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.token_list.map((i) => i.owner.token_id),
                    transaction.args.token_list
                        .map((i) => (i.listing as NftListingListing).price)
                        .reduce((a, b) => bigint2string(string2bigint(a) + string2bigint(b)), ''),
                    `Actions: ${transaction.actions
                        .map(
                            (a) =>
                                `${a.action}(${a.timestamp})${
                                    a.data ? `: ${JSON.stringify(a.data)}` : ''
                                }`,
                        )
                        .join('\n\t')}`,
                    message,
                    log_error,
                );

                await update(id, transaction, 'failed', message);
            } finally {
                transaction_executed(id);
            }
        },
        [checkIdentity, update, icpBalance, icpFee, icpDecimals, icpTransfer],
    );
    return doBatchBuy;
};
const checkArgs = (
    identity: ConnectedIdentity,
    token_list: {
        owner: NftTokenOwner;
        listing: NftListing;
    }[],
): boolean => {
    const owner_account = identity.account;
    for (const o of token_list) {
        if (o.owner.owner === owner_account) {
            message.warning(`You can't buy your own NFT`);
            return false;
        }
    }

    for (const o of token_list) {
        if (o.listing.type !== 'listing') {
            message.warning(`NFT is not listing`);
            return false;
        }
        if (o.listing.token.canister !== getLedgerIcpCanisterId()) {
            message.warning(`Token is not supported`);
            return false;
        }
    }

    if (_.uniq(token_list.map((o) => o.owner.token_id).map(uniqueKey)).length < token_list.length) {
        message.warning(`NFT is repeated`);
        return false;
    }

    return true;
};

const createBatchOrder = async (
    setAction: (action: BatchBuyingAction) => void,
    identity: ConnectedIdentity,
    token_list: {
        owner: NftTokenOwner;
        listing: NftListing;
    }[],
    spend: Spend,
): Promise<BatchOrderInfo> => {
    setAction('CREATING_BATCH_ORDER');
    const { memo, price } = await createBatchBuyOrder(
        identity,
        token_list.map((o) => o.owner.token_id.token_identifier),
    );
    console.debug(`created batch order memo: ${memo} price: ${price}`);
    spend.mark(`CREATING_BATCH_ORDER DONE: got memo -> ${memo} | price -> ${price}`);
    return { memo, price };
};

const checkBalance = async (
    setAction: (action: BatchBuyingAction) => void,
    balance: LedgerTokenBalance | undefined,
    identity: ConnectedIdentity,
    spend: Spend,
    price: string,
    fee: string,
    decimals: number,
): Promise<void> => {
    setAction('CHECKING_BALANCE');
    throwIdentity(identity);
    const e8s = balance?.e8s ?? (await icpAccountBalance(identity.account!)).e8s;
    spend.mark(`CHECKING_BALANCE DONE`);
    const need = BigInt(price) + BigInt(fee);
    if (BigInt(e8s) < need)
        throw new Error(`Insufficient balance.(needs ${exponentNumber(`${need}`, -decimals)}ICP)`);
};

const doPay = async (
    setAction: (action: BatchBuyingAction) => void,
    transfer: LedgerTransferExecutor,
    price: string,
    memo: string,
    spend: Spend,
): Promise<string> => {
    setAction('PAY');

    const yuku_account = principal2account(getYukuCoreCanisterId());
    const height = await transfer({
        to: yuku_account,
        amount: price,
        memo,
    });
    console.debug(`batch buy nft paid ${price}, height:`, height);
    spend.mark(`PAY DONE: ${height}`);

    return height;
};

const submit = async (
    setAction: (action: BatchBuyingAction) => void,
    identity: ConnectedIdentity,
    height: string,
    spend: Spend,
    token_id_list: NftIdentifier[],
): Promise<string[]> => {
    setAction('SUBMITTING_HEIGHT');
    const success_id = await submittingTransferBatchHeight(identity, height, token_id_list);
    spend.mark(`SUBMITTING_HEIGHT DONE`);
    return success_id;
};
