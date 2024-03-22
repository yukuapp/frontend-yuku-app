import { useCallback, useMemo, useState } from 'react';
import { getBackendType } from '@/utils/app/backend';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import { ogyAccountBalance } from '@/utils/canisters/ledgers/ogy';
import { getLedgerIcpCanisterId, getLedgerOgyCanisterId } from '@/utils/canisters/ledgers/special';
import { querySingleTokenOwner } from '@/utils/canisters/nft/nft';
import { createSingleBuyOrder, submittingTransferHeight } from '@/utils/canisters/yuku-old/core';
import { getYukuCoreCanisterId } from '@/utils/canisters/yuku-old/special';
import { queryNftListingData } from '@/utils/nft/listing';
import {
    larkNoticeSingleBuy,
    larkNoticeSingleBuyFailed,
    larkNoticeSingleBuyInitial,
    larkNoticeSingleBuyOver,
} from '@/apis/yuku-logs/single-buy';
import { ERRS_NOT_SEND } from '@/apis/yuku-logs/special';
import { lockOrder, settleOrder } from '@/canisters/entrepot';
import { exponentNumber } from '@/common/data/numbers';
import { isAccountHex, principal2account } from '@/common/ic/account';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { throwIdentity } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import { LedgerTokenBalance } from '@/types/canisters/ledgers';
import {
    BuyingAction,
    BuyNftByTransactionExecutor,
    BuyNftExecutor,
    BuyNftRaw,
    BuyNftRawEntrepot,
    SingleBuyAction,
    SingleBuyTransaction,
} from '@/types/exchange/single-buy';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier, SupportedNftStandard, TokenInfo } from '@/types/nft';
import { useCheckAction } from '../../common/action';
import { useCheckIdentity } from '../../common/identity';
import { useMessage } from '../../common/message';
import { checkWhitelist } from '../../common/whitelist';
import { LedgerTransferExecutor, useTransferByICP, useTransferByOGY } from '../../ledger/transfer';
import { useTransactionRecords } from '../../stores/transaction';
import { transaction_executed, transaction_executing } from '../executing';
import useActionSteps, { MarkAction } from '../steps';

export const useBuyNft = (): {
    buy: BuyNftExecutor;
    action: BuyingAction;
} => {
    const message = useMessage();
    const checkIdentity = useCheckIdentity();
    const checkAction = useCheckAction();

    const [action, setAction] = useState<BuyingAction>(undefined);

    const {
        balance: icpBalance,
        fee: icpFee,
        decimals: icpDecimals,
        transfer: icpTransfer,
    } = useTransferByICP();
    const {
        balance: ogyBalance,
        fee: ogyFee,
        decimals: ogyDecimals,
        transfer: ogyTransfer,
    } = useTransferByOGY();

    const buy = useCallback(
        async (
            token_id: NftIdentifier,
            owner: string | undefined,
            token: TokenInfo,
            price: string,
        ): Promise<boolean> => {
            const identity = checkIdentity();
            if (!checkArgs(identity, owner, () => message.warning(`You can't buy your own NFT`)))
                return false;
            checkAction(action, `Purchasing`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [token.canister, token_id.collection]);

                const spend = Spend.start(`buy nft ${uniqueKey(token_id)}`);

                const { transfer } = await checkBalance(
                    setAction,
                    token,
                    icpBalance,
                    icpFee,
                    icpDecimals,
                    icpTransfer,
                    ogyBalance,
                    ogyFee,
                    ogyDecimals,
                    ogyTransfer,
                    identity,
                    spend,
                    price,
                );

                const memo = await yukuCreateOrder(setAction, identity, token_id, spend);

                const height = await yukuPay(setAction, transfer, price, memo, spend);

                await yukuSubmitHeight(setAction, identity, token_id, height, token, spend);

                return true;
            } catch (e) {
                console.debug(`🚀 ~ file: buy.tsx:138 ~ e:`, e);
                message.error(`Buy NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
            return false;
        },
        [
            checkIdentity,
            action,
            icpBalance,
            icpFee,
            icpDecimals,
            icpTransfer,
            ogyBalance,
            ogyFee,
            ogyDecimals,
            ogyTransfer,
        ],
    );

    return { buy, action };
};

const checkArgs = (
    identity: ConnectedIdentity,
    owner: string | undefined,
    failed: () => void,
): boolean => {
    if (owner && identity.account === owner) {
        failed();
        return false;
    }

    return true;
};

const checkBalance = async (
    setAction: (action: BuyingAction) => void,
    token: TokenInfo,
    icpBalance: LedgerTokenBalance | undefined,
    icpFee: string,
    icpDecimals: number,
    icpTransfer: LedgerTransferExecutor,
    ogyBalance: LedgerTokenBalance | undefined,
    ogyFee: string,
    ogyDecimals: number,
    ogyTransfer: LedgerTransferExecutor,
    identity: ConnectedIdentity,
    spend: Spend,
    price: string,
): Promise<{ fee: string; transfer: LedgerTransferExecutor }> => {
    throwIdentity(identity);
    setAction('CHECKING_BALANCE');
    const { balance, fee, decimals, transfer, accountBalance } = (() => {
        switch (token.symbol) {
            case 'ICP':
                if (token.canister !== getLedgerIcpCanisterId())
                    throw new Error(`unsupported token: ${token.symbol}`);
                return {
                    balance: icpBalance,
                    fee: icpFee,
                    decimals: icpDecimals,
                    transfer: icpTransfer,
                    accountBalance: icpAccountBalance,
                };
            case 'OGY':
                if (token.canister !== getLedgerOgyCanisterId())
                    throw new Error(`unsupported token: ${token.symbol}`);
                return {
                    balance: ogyBalance,
                    fee: ogyFee,
                    decimals: ogyDecimals,
                    transfer: ogyTransfer,
                    accountBalance: ogyAccountBalance,
                };
            default:
                throw new Error(`unsupported token: ${token.symbol}`);
        }
    })();
    const e8s = balance?.e8s ?? (await accountBalance(identity.account!)).e8s;
    spend.mark(`CHECKING_BALANCE DONE`);
    const need = BigInt(price) + BigInt(fee);
    if (BigInt(e8s) < need)
        throw new Error(
            `Insufficient balance.(needs ${exponentNumber(`${need}`, -decimals)}${token.symbol})`,
        );

    return { fee, transfer };
};

const entrepotPay = async (
    setAction: (action: BuyingAction) => void,
    to: string,
    price: string,
    transfer: LedgerTransferExecutor,
    spend: Spend,
): Promise<string> => {
    setAction('PAY');
    if (!isAccountHex(to)) {
        throw new Error('par to must be account hex!');
    }

    const height = await transfer({
        to,
        amount: price,
    });
    console.debug(`buy nft entre paid ${price}, height:`, height);
    spend.mark(`PAY DONE: ${height}`);
    return height;
};

const yukuCreateOrder = async (
    setAction: (action: BuyingAction) => void,
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
    spend: Spend,
): Promise<string> => {
    setAction('CREATING_ORDER');
    const { memo } = await createSingleBuyOrder(identity, token_id.token_identifier);
    console.debug(`created order memo:`, memo);
    spend.mark(`CREATING_ORDER DONE: got memo -> ${memo}`);

    return memo;
};

const yukuPay = async (
    setAction: (action: BuyingAction) => void,
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
    console.debug(`buy nft paid ${price}, height:`, height);
    spend.mark(`PAY DONE: ${height}`);

    return height;
};

const yukuSubmitHeight = async (
    setAction: (action: BuyingAction) => void,
    identity: ConnectedIdentity,
    token_id: NftIdentifier,
    height: string,
    token: TokenInfo,
    spend: Spend,
): Promise<void> => {
    setAction('SUBMITTING_HEIGHT');
    await submittingTransferHeight(identity, {
        token_id,
        height,
        token,
    });
    spend.mark(`SUBMITTING_HEIGHT DONE`);
};

export const useBuyingActionSteps = (
    action: BuyingAction,
    standard: SupportedNftStandard,
): {
    show: boolean;
    hide: () => void;
    failed: boolean;
    fail: () => void;
    title: string;
    actions: MarkAction<BuyingAction>[];
} => {
    const { show, hide, failed, fail } = useActionSteps(action);

    const { title, actions }: { title: string; actions: MarkAction<BuyingAction>[] } =
        useMemo(() => {
            const title = 'Buy NFT';
            const actions: MarkAction<BuyingAction>[] =
                standard === 'ogy'
                    ? [
                          {
                              title: 'Check order status and check wallet balance',
                              actions: ['CHECKING_BALANCE'],
                          },
                          {
                              actions: ['OGY_QUERY_PAY_ACCOUNT'],
                              title: 'Query pay account',
                          },
                          {
                              actions: ['PAY'],
                              title: 'Pay',
                          },
                          {
                              actions: ['OGY_BID_NFT'],
                              title: 'Purchasing your NFT',
                          },
                          {
                              actions: ['OGY_BID_NFT_SUCCESS'],
                              title: 'Check your NFT purchased',
                          },
                      ]
                    : standard === 'entrepot'
                    ? [
                          {
                              title: 'Check order status and check wallet balance',
                              actions: ['CHECKING_BALANCE'],
                          },
                          {
                              actions: ['ENTRE_LOCK_PAY_ACCOUNT'],
                              title: 'Lock order and query pay account',
                          },
                          {
                              actions: ['PAY'],
                              title: 'Pay',
                          },
                          {
                              actions: ['SETTLE'],
                              title: 'Purchasing your NFT',
                          },
                          {
                              actions: ['SUCCESS'],
                              title: 'Check your NFT purchased',
                          },
                      ]
                    : [
                          {
                              title: 'Check order status and check wallet balance',
                              actions: ['DOING', 'CHECKING_BALANCE'],
                          },
                          {
                              title: 'Calling the wallet to initiate a transfer',
                              actions: ['CREATING_ORDER'],
                          },
                          { title: 'Calling Ledger to validate transactions', actions: ['PAY'] },
                          { title: 'Transferring item', actions: ['SUBMITTING_HEIGHT'] },
                      ];
            return { title, actions };
        }, [standard]);

    return {
        show,
        hide,
        failed,
        fail,
        title,
        actions,
    };
};

export const useBuyNftByTransaction = (): {
    buy: BuyNftExecutor;
    action: BuyingAction;
} => {
    const checkIdentity = useCheckIdentity();

    const message = useMessage();

    const insert = useTransactionStore((s) => s.insert);

    const [id, setId] = useState<string | undefined>(undefined);
    const { record } = useTransactionRecords(id);

    const buy = useCallback(
        async (
            token_id: NftIdentifier,
            owner: string | undefined,
            token: TokenInfo,
            price: string,
            raw: BuyNftRaw,
        ): Promise<boolean> => {
            const identity = checkIdentity();
            if (!checkArgs(identity, owner, () => message.warning(`You can't buy your own NFT`)))
                return false;
            throwIdentity(identity);
            const id = await insert(identity.principal!, {
                type: 'single-buy',
                args: { token_id, owner: owner!, token, price, raw },
                actions: [],
                paid: 0,
            }).catch((e) => {
                message.error(e.message);
                return undefined;
            });
            if (!id) return false;
            setId(id);

            larkNoticeSingleBuyInitial(
                getBackendType(),
                id,
                identity.principal!,
                token_id,
                token,
                price,
                raw.standard === 'ogy'
                    ? `sale_id: ${raw.sale_id}
                broker_id: ${raw.broker_id}
                seller: ${raw.seller}`
                    : '',
            );
            return true;
        },
        [checkIdentity, insert],
    );

    const action = useMemo(() => {
        if (record === undefined) return undefined;
        const transaction = record.transaction as SingleBuyTransaction;
        const actions = transaction.actions;
        if (actions.length === 0) return undefined;
        return actions[actions.length - 1].action;
    }, [record]);

    return { buy, action };
};

export const useDoBuyNftByTransaction = (): BuyNftByTransactionExecutor => {
    const checkIdentity = useCheckIdentity();
    const message = useMessage();

    const update = useTransactionStore((s) => s.update);

    const {
        balance: icpBalance,
        fee: icpFee,
        decimals: icpDecimals,
        transfer: icpTransfer,
    } = useTransferByICP(true);
    const {
        balance: ogyBalance,
        fee: ogyFee,
        decimals: ogyDecimals,
        transfer: ogyTransfer,
    } = useTransferByOGY(true);

    const doBuy = useCallback(
        async (id: string, created: number, transaction: SingleBuyTransaction, manual: boolean) => {
            const identity = checkIdentity();
            throwIdentity(identity);
            if (
                !checkArgs(identity, transaction.args.owner, () =>
                    message.warning(`You can't buy your own NFT`),
                )
            )
                return;
            if (!transaction_executing(id)) return;

            const spend = Spend.start(
                `buy nft by transaction ${uniqueKey(transaction.args.token_id)}`,
            );
            let done_action = false;
            function doAction<T>(
                action: BuyingAction,
                fetch_action: (action: SingleBuyAction<T>) => Promise<T>,
                do_action: () => Promise<T>,
            ): Promise<T> {
                return new Promise((resolve, reject) => {
                    const action_with_data = transaction.actions.find((a) => a.action === action);
                    if (action_with_data) {
                        spend.mark(`already done ${action}`);
                        fetch_action(action_with_data).then(resolve).catch(reject);
                    } else {
                        done_action = true;

                        const now = larkNoticeSingleBuy(0, getBackendType(), id, action ?? '');
                        do_action()
                            .then((d) => {
                                larkNoticeSingleBuy(
                                    now,
                                    getBackendType(),
                                    id,
                                    action ?? '',
                                    d ? `${d}` : '',
                                );
                                resolve(d);
                            })
                            .catch(reject);
                    }
                });
            }

            const setAction = () => {};

            try {
                await checkWhitelist(identity, [
                    transaction.args.token.canister,
                    transaction.args.token_id.collection,
                ]);

                await doAction(
                    'DOING',
                    async () => {},
                    async () => {
                        transaction.actions.push({ action: 'DOING', timestamp: Date.now() });
                        await update(id, transaction, 'executing');
                    },
                );
                if (done_action) return;

                const { transfer } = await (async () => {
                    if (transaction.actions.find((a) => a.action === 'PAY'))
                        return { fee: icpFee, transfer: icpTransfer };
                    const checkedBalance = transaction.actions.find(
                        (a) => a.action === 'CHECKING_BALANCE',
                    );
                    if (checkedBalance && Date.now() < checkedBalance.timestamp + 15000) {
                        switch (transaction.args.token.symbol) {
                            case 'ICP':
                                return {
                                    fee: icpFee,
                                    transfer: icpTransfer,
                                };
                            case 'OGY':
                                return {
                                    fee: ogyFee,
                                    transfer: ogyTransfer,
                                };
                            default:
                                throw new Error(
                                    `unsupported token: ${transaction.args.token.symbol}`,
                                );
                        }
                    }
                    const r = await checkBalance(
                        setAction,
                        transaction.args.token,
                        icpBalance,
                        icpFee,
                        icpDecimals,
                        icpTransfer,
                        ogyBalance,
                        ogyFee,
                        ogyDecimals,
                        ogyTransfer,
                        identity,
                        spend,
                        transaction.args.price,
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
                    return r;
                })();

                if (transaction.args.raw.standard === 'entrepot') {
                    const raw = transaction.args.raw as BuyNftRawEntrepot;

                    await doAction<string>(
                        'ENTRE_LOCK_PAY_ACCOUNT',
                        async (action) => action.data!,
                        async () => {
                            const sub_account = await lockOrder(identity, {
                                token_id: raw.token_id,
                                price: raw.price,
                            });
                            transaction.actions.push({
                                action: 'ENTRE_LOCK_PAY_ACCOUNT',
                                timestamp: Date.now(),
                                data: { sub_account },
                            });
                            await update(id, transaction, 'executing');
                            return sub_account;
                        },
                    );
                    if (done_action) return;

                    if (
                        transaction.actions.find((a) => a.action === 'PAY') ||
                        transaction.paid === 0 ||
                        manual
                    ) {
                        await doAction(
                            'PAY',
                            async (action) => action.data!,
                            async () => {
                                transaction.paid++;
                                await update(id, transaction, 'executing');
                                const to = transaction.actions.find(
                                    (a) => a.action === 'ENTRE_LOCK_PAY_ACCOUNT',
                                )?.data['sub_account'];
                                if (!to) {
                                    throw new Error('cant find sub_account to pay');
                                }
                                const height = await entrepotPay(
                                    setAction,
                                    to,
                                    transaction.args.price,
                                    transfer,
                                    spend,
                                );
                                if (!height) {
                                    throw new Error(`Pay failed. Please Contact Yuku`);
                                }
                                transaction.actions.push({
                                    action: 'PAY',
                                    timestamp: Date.now(),
                                    data: height,
                                });
                                await update(id, transaction, 'executing');
                                return height;
                            },
                        );
                    } else {
                        throw new Error('pay is forbidden');
                    }
                    if (done_action) return;

                    await doAction(
                        'SETTLE',
                        async (action) => action.data!,
                        async () => {
                            const success = await settleOrder(identity, {
                                token_id: raw.token_id,
                            });
                            transaction.actions.push({
                                action: 'SETTLE',
                                timestamp: Date.now(),
                                data: { success },
                            });
                            await update(id, transaction, 'executing');
                            return success;
                        },
                    );
                    if (done_action) return;

                    (async () => {
                        const owner = await querySingleTokenOwner(
                            transaction.args.token_id.collection,
                            transaction.args.token_id.token_identifier,
                        );
                        const isSelf = owner === identity.account;
                        const isListing =
                            (await queryNftListingData(transaction.args.token_id)).listing.type ===
                            'listing';
                        if (!isListing && !isSelf) {
                            throw new Error(
                                'buy entrepot nft failed,purchased by someone already.',
                            );
                        }
                        if (!isListing && isSelf) {
                            transaction.actions.push({
                                action: 'SUCCESS',
                                timestamp: Date.now(),
                            });
                            await update(id, transaction, 'successful');

                            larkNoticeSingleBuyOver(
                                created,
                                getBackendType(),
                                id,
                                identity.principal!,
                                transaction.args.token_id,
                                transaction.args.token,
                                transaction.args.price,
                                `Actions: ${transaction.actions
                                    .map(
                                        (a) =>
                                            `${a.action}(${a.timestamp})${
                                                a.data ? `: ${a.data}` : ''
                                            }`,
                                    )
                                    .join('\n\t')}`,
                            );
                        }
                    })();
                } else {
                    const memo = await doAction(
                        'CREATING_ORDER',
                        async (action) => action.data!,
                        async () => {
                            const memo = await yukuCreateOrder(
                                setAction,
                                identity,
                                transaction.args.token_id,
                                spend,
                            );
                            transaction.actions.push({
                                action: 'CREATING_ORDER',
                                timestamp: Date.now(),
                                data: memo,
                            });
                            await update(id, transaction, 'executing');
                            return memo;
                        },
                    );
                    if (done_action) return;

                    let height: string;
                    if (
                        transaction.actions.find((a) => a.action === 'PAY') ||
                        transaction.paid === 0 ||
                        manual
                    ) {
                        height = await doAction(
                            'PAY',
                            async (action) => action.data!,
                            async () => {
                                transaction.paid++;
                                await update(id, transaction, 'executing');
                                const height = await yukuPay(
                                    setAction,
                                    transfer,
                                    transaction.args.price,
                                    memo,
                                    spend,
                                );
                                if (!height) {
                                    throw new Error(
                                        `Pay failed. Contact Yuku with order id: ${memo}`,
                                    );
                                }
                                transaction.actions.push({
                                    action: 'PAY',
                                    timestamp: Date.now(),
                                    data: height,
                                });
                                await update(id, transaction, 'executing');
                                return height;
                            },
                        );
                    } else {
                        throw new Error('auto pay is forbidden');
                    }
                    if (done_action) return;

                    await doAction(
                        'SUBMITTING_HEIGHT',
                        async () => {},
                        async () => {
                            await yukuSubmitHeight(
                                setAction,
                                identity,
                                transaction.args.token_id,
                                height,
                                transaction.args.token,
                                spend,
                            );
                            transaction.actions.push({
                                action: 'SUBMITTING_HEIGHT',
                                timestamp: Date.now(),
                                data: height,
                            });
                            await update(id, transaction, 'successful');
                        },
                    );

                    larkNoticeSingleBuyOver(
                        created,
                        getBackendType(),
                        id,
                        identity.principal!,
                        transaction.args.token_id,
                        transaction.args.token,
                        transaction.args.price,
                        `Actions: ${transaction.actions
                            .map((a) => `${a.action}(${a.timestamp})${a.data ? `: ${a.data}` : ''}`)
                            .join('\n\t')}`,
                    );
                }
            } catch (e: any) {
                console.debug(`🚀 ~ file: buy.tsx:619 ~ e:`, e);
                const message = `${e.message ?? e}`;
                const log_error = !ERRS_NOT_SEND.find((m) => message.indexOf(m) !== -1);

                larkNoticeSingleBuyFailed(
                    created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.token_id,
                    transaction.args.token,
                    transaction.args.price,
                    `Actions: ${transaction.actions
                        .map((a) => `${a.action}(${a.timestamp})${a.data ? `: ${a.data}` : ''}`)
                        .join('\n\t')}`,
                    message,
                    log_error,
                );

                await update(id, transaction, 'failed', message);
            } finally {
                transaction_executed(id);
            }
        },
        [
            checkIdentity,
            update,
            icpBalance,
            icpFee,
            icpDecimals,
            icpTransfer,
            ogyBalance,
            ogyFee,
            ogyDecimals,
            ogyTransfer,
        ],
    );

    return doBuy;
};
