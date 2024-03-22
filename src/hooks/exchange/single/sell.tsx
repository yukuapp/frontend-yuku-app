import { useCallback, useMemo, useState } from 'react';
import message from '@/components/message';
import { useCheckIdentity } from '@/hooks/common/identity';
import { useMessage } from '@/hooks/common/message';
import { useTransactionRecords } from '@/hooks/stores/transaction';
import { getBackendType } from '@/utils/app/backend';
import {
    getLedgerIcpCanisterId,
    getLedgerIcpDecimals,
    getLedgerIcpFee,
    getLedgerOgyCanisterId,
    getLedgerOgyDecimals,
    getLedgerOgyFee,
} from '@/utils/canisters/ledgers/special';
import { allowance, approve, transferFrom as transferFromByExt } from '@/utils/canisters/nft/ext';
import {
    afterDepositingNft,
    beforeDepositingNft,
    queryNftDepositor,
} from '@/utils/canisters/yuku-old/ccc_proxy';
import { listing } from '@/utils/canisters/yuku-old/core';
import {
    getYukuCccProxyCanisterId,
    getYukuCoreCanisterId,
} from '@/utils/canisters/yuku-old/special';
import {
    larkNoticeSingleSell,
    larkNoticeSingleSellFailed,
    larkNoticeSingleSellInitial,
    larkNoticeSingleSellOver,
} from '@/apis/yuku-logs/single-sell';
import { ERRS_NOT_SEND } from '@/apis/yuku-logs/special';
import { transferFrom as transferFromByCcc } from '@/canisters/nft/nft_ccc';
import { NFT_EXT_WITHOUT_APPROVE } from '@/canisters/nft/special';
import { exponentNumber, isValidNumber } from '@/common/data/numbers';
import { parse_token_index_with_checking } from '@/common/nft/ext';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { throwIdentity } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import {
    SellingAction,
    SellNftByTransactionExecutor,
    SellNftExecutor,
    SingleSellAction,
    SingleSellTransaction,
} from '@/types/exchange/single-sell';
import { ConnectedIdentity } from '@/types/identity';
import { SupportedNftStandard, TokenInfo } from '@/types/nft';
import { NftTokenOwner } from '@/types/nft';
import { useCheckAction } from '../../common/action';
import { checkWhitelist } from '../../common/whitelist';
import { transaction_executed, transaction_executing } from '../executing';
import useActionSteps, { MarkAction } from '../steps';

export const useSellNft = (): {
    sell: SellNftExecutor;
    action: SellingAction;
} => {
    const checkAction = useCheckAction();

    const [action, setAction] = useState<SellingAction>(undefined);

    const sell = useCallback(
        async (
            identity: ConnectedIdentity,
            owner: NftTokenOwner,
            token: TokenInfo,
            price: string,
        ): Promise<boolean> => {
            checkAction(action, `Selling`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [owner.token_id.collection]);

                const spend = Spend.start(`sell nft ${uniqueKey(owner.token_id)}`);

                await checkToken(token);

                await doApproving(setAction, identity, owner, spend);
                if (owner.raw.standard === 'ogy') return true;

                await yukuRecord(setAction, price, token, identity, owner, spend);

                return true;
            } catch (e) {
                console.debug(`🚀 ~ file: sell.tsx:113 ~ e:`, e);
                message.error(`Sell NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
            return false;
        },
        [action],
    );

    return { sell, action };
};
const checkToken = async (token: TokenInfo): Promise<void> => {
    switch (token.symbol) {
        case 'ICP':
            if (
                token.canister !== getLedgerIcpCanisterId() ||
                token.decimals !== `${getLedgerIcpDecimals()}` ||
                token.fee !== getLedgerIcpFee()
            ) {
                throw new Error(`wrong token info`);
            }
            break;
        case 'OGY':
            if (
                token.canister !== getLedgerOgyCanisterId() ||
                token.decimals !== `${getLedgerOgyDecimals()}` ||
                token.fee !== getLedgerOgyFee()
            ) {
                throw new Error(`wrong token info`);
            }
            break;
        default:
            throw new Error(`token ${token.symbol} is not supported`);
    }
};

const doApproving = async (
    setAction: (action: SellingAction) => void,
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    spend: Spend,
): Promise<void> => {
    setAction('APPROVING');
    await doApprove(identity, owner, setAction, spend);
    spend.mark(`APPROVING DONE`);
};

export const doApprove = async (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    setAction: (action: SellingAction) => void,
    spend: Spend,
): Promise<void> => {
    if (
        owner.raw.standard === 'ccc' ||
        NFT_EXT_WITHOUT_APPROVE.includes(owner.token_id.collection)
    ) {
        // ? CCC
        setAction('APPROVING_CCC');
        await approveByCcc(identity, owner, setAction, spend);
        spend.mark(`APPROVING_CCC DONE`);
    } else {
        setAction('APPROVING_EXT');
        await approveByExt(identity, owner, setAction, spend);
        spend.mark(`APPROVING_EXT DONE`);
    }
};

const approveByCcc = async (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    setAction: (action: SellingAction) => void,
    spend: Spend,
): Promise<void> => {
    const token_index = parse_token_index_with_checking(
        owner.token_id.collection,
        owner.token_id.token_identifier,
    );
    throwIdentity(identity);

    setAction('APPROVING_CCC_CHECKING_TRANSFERRED');
    const checking = await queryNftDepositor(owner.token_id.collection, token_index);
    spend.mark(`APPROVING_CCC_CHECKING_TRANSFERRED DONE`);
    if (checking === identity.principal) return;

    setAction('APPROVING_CCC_BEFORE_TRANSFERRING');
    await beforeDepositingNft(identity, {
        collection: owner.token_id.collection,
        token_index,
    });
    spend.mark(`APPROVING_CCC_BEFORE_TRANSFERRING DONE`);

    setAction('APPROVING_CCC_TRANSFERRING');
    owner.raw.standard === 'ext'
        ? await transferFromByExt(identity, owner.token_id.collection, {
              token_identifier: owner.token_id.token_identifier,
              from: { address: owner.owner },
              to: { principal: getYukuCccProxyCanisterId() },
          })
        : await transferFromByCcc(identity, owner.token_id.collection, {
              owner: identity.principal!,
              token_index,
              to: getYukuCccProxyCanisterId(),
          });
    spend.mark(`APPROVING_CCC_TRANSFERRING DONE`);

    setAction('APPROVING_CCC_AFTER_TRANSFERRING');
    await afterDepositingNft(identity, {
        collection: owner.token_id.collection,
        token_index,
    });
    spend.mark(`APPROVING_CCC_AFTER_TRANSFERRING DONE`);
};

const approveByExt = async (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    setAction: (action: SellingAction) => void,
    spend: Spend,
): Promise<void> => {
    throwIdentity(identity);
    const args_allowance = {
        token_identifier: owner.token_id.token_identifier,
        owner: { principal: identity.principal! },
        spender: getYukuCoreCanisterId(),
    };

    const args_approve = {
        token_identifier: owner.token_id.token_identifier,
        spender: getYukuCoreCanisterId(),
    };

    setAction('APPROVING_EXT_CHECKING');
    const checking = await allowance(owner.token_id.collection, args_allowance);
    spend.mark(`APPROVING_EXT_CHECKING DONE`);
    if (checking) return;

    setAction('APPROVING_EXT_APPROVING');
    await approve(identity, owner.token_id.collection, args_approve);
    spend.mark(`APPROVING_EXT_APPROVING DONE`);

    setAction('APPROVING_EXT_CHECKING_AGAIN');
    const checking_again = await allowance(owner.token_id.collection, args_allowance);
    spend.mark(`APPROVING_EXT_APPROVING DONE`);
    if (!checking_again) throw new Error(`Approve failed.`);
};

const yukuRecord = async (
    setAction: (action: SellingAction) => void,
    price: string,
    token: TokenInfo,
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    spend: Spend,
): Promise<void> => {
    setAction('yuku_LISTING');
    const actually = exponentNumber(price, Number(token.decimals));
    await listing(identity, {
        token_identifier: owner.token_id.token_identifier,
        token,
        price: `${actually}`,
    });
    spend.mark(`yuku_LISTING DONE`);
};

export const checkSellPrice = (price: string, decimals: number, min?: number): string => {
    if (!isValidNumber(price, decimals)) {
        return 'Wrong price.';
    }
    const p = Number(price);
    if (p < (min ?? 0)) {
        return `Price must be greater than ${min ?? 0}.`;
    }
    if (p > 1e4) {
        return 'Price is too high.';
    }
    return '';
};

export const useSellingActionSteps = (
    action: SellingAction,
    standard: SupportedNftStandard,
    collection: string,
): {
    show: boolean;
    hide: () => void;
    failed: boolean;
    fail: () => void;
    title: string;
    actions: MarkAction<SellingAction>[];
} => {
    const { show, hide, failed, fail } = useActionSteps(action);

    const { title, actions }: { title: string; actions: MarkAction<SellingAction>[] } =
        useMemo(() => {
            const title = 'Sell NFT';
            const actions: MarkAction<SellingAction>[] =
                standard === 'ccc' || NFT_EXT_WITHOUT_APPROVE.includes(collection)
                    ? [
                          {
                              actions: [
                                  'APPROVING',
                                  'APPROVING_CCC',
                                  'APPROVING_CCC_CHECKING_TRANSFERRED',
                                  'APPROVING_CCC_BEFORE_TRANSFERRING',
                                  'APPROVING_CCC_TRANSFERRING',
                                  'APPROVING_CCC_AFTER_TRANSFERRING',
                              ],
                              title: 'Approve first',
                          },
                          { actions: ['yuku_LISTING'], title: 'Record your sell info' },
                      ]
                    : [
                          {
                              actions: [
                                  'APPROVING',
                                  'APPROVING_EXT',
                                  'APPROVING_EXT_CHECKING',
                                  'APPROVING_EXT_APPROVING',
                                  'APPROVING_EXT_CHECKING_AGAIN',
                              ],
                              title: 'Approve first',
                          },
                          { actions: ['yuku_LISTING'], title: 'Record your sell info' },
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

export const useSellNftByTransaction = (): {
    sell: SellNftExecutor;
    executing: boolean;
} => {
    const message = useMessage();

    const insert = useTransactionStore((s) => s.insert);

    const [id, setId] = useState<string | undefined>(undefined);
    const { record } = useTransactionRecords(id);

    const sell = useCallback(
        async (
            identity: ConnectedIdentity,
            owner: NftTokenOwner,
            token: TokenInfo,
            price: string,
        ): Promise<boolean> => {
            throwIdentity(identity);
            try {
                await checkToken(token);
            } catch (e) {
                message.error(`wrong token`);
                return false;
            }

            const id = await insert(identity.principal!, {
                type: 'single-sell',
                args: { owner, token, price },
                actions: [],
            }).catch((e) => {
                message.error(e.message);
                return undefined;
            });
            setId(id);
            if (!id) {
                return false;
            }

            larkNoticeSingleSellInitial(
                getBackendType(),
                id,
                identity.principal!,
                owner.token_id,
                token,
                price,
                '',
            );
            return true;
        },
        [insert],
    );

    return { sell, executing: record?.status === 'executing' };
};

export const useDoSellNftByTransaction = (): SellNftByTransactionExecutor => {
    const checkIdentity = useCheckIdentity();

    const update = useTransactionStore((s) => s.update);

    const doSell = useCallback(
        async (id: string, _created: number, transaction: SingleSellTransaction) => {
            const identity = checkIdentity();
            throwIdentity(identity);
            if (!transaction_executing(id)) return;
            const spend = Spend.start(
                `sell nft by transaction ${uniqueKey(transaction.args.owner.token_id)}`,
            );
            let done_action = false;

            function doAction<T>(
                action: SellingAction,
                fetch_action: (action: SingleSellAction<T>) => Promise<T>,
                do_action: () => Promise<T>,
            ): Promise<T> {
                return new Promise((resolve, reject) => {
                    const action_with_data = transaction.actions.find((a) => a.action === action);
                    if (action_with_data) {
                        spend.mark(`already done ${action}`);
                        fetch_action(action_with_data).then(resolve).catch(reject);
                    } else {
                        done_action = true;

                        const now = larkNoticeSingleSell(0, getBackendType(), id, action ?? '');
                        do_action()
                            .then((d) => {
                                larkNoticeSingleSell(
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

            try {
                await checkWhitelist(identity, [transaction.args.owner.token_id.collection]);

                await doAction(
                    'DOING',
                    async () => {},
                    async () => {
                        transaction.actions.push({ action: 'DOING', timestamp: Date.now() });
                        await update(id, transaction, 'executing');
                    },
                );
                if (done_action) return;

                if (
                    transaction.args.owner.raw.standard === 'ccc' ||
                    NFT_EXT_WITHOUT_APPROVE.includes(transaction.args.owner.token_id.collection)
                ) {
                    const token_index = parse_token_index_with_checking(
                        transaction.args.owner.token_id.collection,
                        transaction.args.owner.token_id.token_identifier,
                    );

                    await doAction(
                        'APPROVING_CCC_CHECKING_TRANSFERRED',
                        async () => {},
                        async () => {
                            await (async () => {
                                const checking = await queryNftDepositor(
                                    transaction.args.owner.token_id.collection,
                                    token_index,
                                );
                                spend.mark(`APPROVING_CCC_CHECKING_TRANSFERRED DONE`);
                                if (checking === identity.principal) return;

                                try {
                                    await beforeDepositingNft(identity, {
                                        collection: transaction.args.owner.token_id.collection,
                                        token_index,
                                    });
                                    spend.mark(`APPROVING_CCC_BEFORE_TRANSFERRING DONE`);
                                } catch (error) {
                                    console.error(
                                        '🚀 ~ file: sell.tsx:713 ~ await ~ error:',
                                        error,
                                    );
                                    await afterDepositingNft(identity, {
                                        collection: transaction.args.owner.token_id.collection,
                                        token_index,
                                    });
                                    return;
                                }

                                transaction.args.owner.raw.standard === 'ext'
                                    ? await transferFromByExt(
                                          identity,
                                          transaction.args.owner.token_id.collection,
                                          {
                                              token_identifier:
                                                  transaction.args.owner.token_id.token_identifier,
                                              from: { address: transaction.args.owner.owner },
                                              to: { principal: getYukuCccProxyCanisterId() },
                                          },
                                      )
                                    : await transferFromByCcc(
                                          identity,
                                          transaction.args.owner.token_id.collection,
                                          {
                                              owner: identity.principal!,
                                              token_index,
                                              to: getYukuCccProxyCanisterId(),
                                          },
                                      );
                                spend.mark(`APPROVING_CCC_TRANSFERRING DONE`);

                                await afterDepositingNft(identity, {
                                    collection: transaction.args.owner.token_id.collection,
                                    token_index,
                                });
                                spend.mark(`APPROVING_CCC_AFTER_TRANSFERRING DONE`);
                            })();
                            transaction.actions.push({
                                action: 'APPROVING_CCC_CHECKING_TRANSFERRED',
                                timestamp: Date.now(),
                            });
                            await update(id, transaction, 'executing');
                        },
                    );
                    if (done_action) return;
                } else {
                    const args_allowance = {
                        token_identifier: transaction.args.owner.token_id.token_identifier,
                        owner: { principal: identity.principal! },
                        spender: getYukuCoreCanisterId(),
                    };

                    const args_approve = {
                        token_identifier: transaction.args.owner.token_id.token_identifier,
                        spender: getYukuCoreCanisterId(),
                    };

                    await doAction(
                        'APPROVING_EXT',
                        async () => {},
                        async () => {
                            await (async () => {
                                const checking = await allowance(
                                    transaction.args.owner.token_id.collection,
                                    args_allowance,
                                );
                                spend.mark(`APPROVING_EXT_CHECKING DONE`);
                                if (checking) return;

                                await approve(
                                    identity,
                                    transaction.args.owner.token_id.collection,
                                    args_approve,
                                );
                                spend.mark(`APPROVING_EXT_APPROVING DONE`);

                                const checking_again = await allowance(
                                    transaction.args.owner.token_id.collection,
                                    args_allowance,
                                );
                                spend.mark(`APPROVING_EXT_APPROVING DONE`);
                                if (!checking_again) throw new Error(`Approve failed.`);
                            })();
                            transaction.actions.push({
                                action: 'APPROVING_EXT',
                                timestamp: Date.now(),
                            });
                            await update(id, transaction, 'executing');
                        },
                    );
                    if (done_action) return;
                }

                const actually = exponentNumber(
                    transaction.args.price,
                    Number(transaction.args.token.decimals),
                );
                await doAction(
                    'yuku_LISTING',
                    async () => {},
                    async () => {
                        await update(id, transaction, 'executing');
                        await listing(identity, {
                            token_identifier: transaction.args.owner.token_id.token_identifier,
                            token: transaction.args.token,
                            price: `${actually}`,
                        });
                        spend.mark(`yuku_LISTING DONE`);
                        transaction.actions.push({ action: 'yuku_LISTING', timestamp: Date.now() });
                        await update(id, transaction, 'successful');
                    },
                );

                larkNoticeSingleSellOver(
                    _created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.owner.token_id,
                    transaction.args.token,
                    transaction.args.price,
                    `Actions: ${transaction.actions
                        .map((a) => `${a.action}(${a.timestamp})${a.data ? `: ${a.data}` : ''}`)
                        .join('\n\t')}`,
                );
            } catch (e: any) {
                const message = `${e.message ?? e}`;

                console.debug('🚀 ~ file: sell.tsx:846 ~ message:', message);

                const log_error = !ERRS_NOT_SEND.find((m) => message.indexOf(m) !== -1);

                larkNoticeSingleSellFailed(
                    _created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.owner.token_id,
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
        [checkIdentity, update],
    );

    return doSell;
};
