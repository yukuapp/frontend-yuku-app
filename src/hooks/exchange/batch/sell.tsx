import { useCallback, useMemo, useState } from 'react';
import _ from 'lodash';
import message from '@/components/message';
import { useCheckIdentity } from '@/hooks/common/identity';
import { useMessage } from '@/hooks/common/message';
import { useTransactionRecords } from '@/hooks/stores/transaction';
import { getBackendType } from '@/utils/app/backend';
import { getTokenDecimals } from '@/utils/canisters/ledgers/special';
import { batchListing } from '@/utils/canisters/yuku-old/core';
import {
    larkNoticeBatchSell,
    larkNoticeBatchSellFailed,
    larkNoticeBatchSellInitial,
    larkNoticeBatchSellOver,
} from '@/apis/yuku-logs/batch-sell';
import { ERRS_NOT_SEND } from '@/apis/yuku-logs/special';
import { exponentNumber } from '@/common/data/numbers';
import { uniqueKey } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { bigint2string, string2bigint } from '@/common/types/bigint';
import { throwIdentity } from '@/stores/identity';
import { useTransactionStore } from '@/stores/transaction';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import {
    BatchSellingAction,
    BatchSellingByTransactionExecutor,
    BatchSellingTransaction,
    BatchSellNftExecutor,
} from '@/types/exchange/batch-sell';
import { ConnectedIdentity } from '@/types/identity';
import { BatchNftSale } from '@/types/yuku';
import { useCheckAction } from '../../common/action';
import { checkWhitelist } from '../../common/whitelist';
import { transaction_executed, transaction_executing } from '../executing';
import { doApprove } from '../single/sell';
import useActionSteps, { MarkAction, useDoAction } from '../steps';

export const useBatchSellNft = (): {
    batchSell: BatchSellNftExecutor;
    action: BatchSellingAction;
    success: BatchNftSale[] | undefined;
    failed: BatchNftSale[] | undefined;
} => {
    const checkAction = useCheckAction();

    const [action, setAction] = useState<BatchSellingAction>(undefined);
    const [success, setSuccess] = useState<BatchNftSale[] | undefined>(undefined);
    const [failed, setFailed] = useState<BatchNftSale[] | undefined>(undefined);

    const batchSell = useCallback(
        async (
            identity: ConnectedIdentity,
            sales: BatchNftSale[],
        ): Promise<BatchNftSale[] | undefined> => {
            if (!checkArgs(identity, sales)) return undefined;
            checkAction(action, `Batch selling`);

            setAction('DOING');
            try {
                await checkWhitelist(identity, [...sales.map((item) => item.token_id.collection)]);

                const spend = Spend.start(
                    `batch sell nfts ${sales.map((s) => uniqueKey(s.token_id)).join('|')}`,
                );

                await checkBatchWhiteList(setAction, spend);

                const success: BatchNftSale[] = [];
                const failed: BatchNftSale[] = [];
                await doBatchApproving(
                    setAction,
                    success,
                    failed,
                    setSuccess,
                    setFailed,
                    identity,
                    sales,
                    spend,
                );

                await doYukuRecord(setAction, success, identity, spend);

                return sales;
            } catch (e) {
                message.error(`Batch sell NFT failed: ${e}`);
            } finally {
                setAction(undefined);
            }
        },
        [action],
    );

    return { batchSell, action, success, failed };
};
export const useBatchSellingActionSteps = (
    action: BatchSellingAction,
): {
    show: boolean;
    hide: () => void;
    failed: boolean;
    fail: () => void;
    title: string;
    actions: MarkAction<BatchSellingAction>[];
} => {
    const { show, hide, failed, fail } = useActionSteps(action);

    const { title, actions }: { title: string; actions: MarkAction<BatchSellingAction>[] } =
        useMemo(() => {
            const title = 'Batch Sell NFT';
            const actions: MarkAction<BatchSellingAction>[] = [
                {
                    title: 'Check order status and check wallet balance',
                    actions: ['DOING', 'BATCH_WHITELIST'],
                },
                {
                    title: 'Approving ',
                    actions: ['BATCH_APPROVING'],
                },
                {
                    title: 'Committing your listings',
                    actions: ['BATCH_yuku_LISTING'],
                },
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
const getBatchSellTotalPrice = (sales: BatchNftSale[], symbol: SupportedLedgerTokenSymbol) => {
    const price = sales
        .filter((s) => s.token.symbol.toLocaleUpperCase() === symbol)
        .map((s) => s.price)
        .reduce((a, b) => bigint2string(string2bigint(a) + string2bigint(b)), '');
    return exponentNumber(price, -getTokenDecimals(symbol));
};

export const useBatchSellNftByTransaction = (): {
    batchSell: BatchSellNftExecutor;
    executing: boolean;
} => {
    const message = useMessage();

    const insert = useTransactionStore((s) => s.insert);

    const [id, setId] = useState<string | undefined>(undefined);
    const { record } = useTransactionRecords(id);

    const batchSell = useCallback(
        async (
            identity: ConnectedIdentity,
            sales: BatchNftSale[],
        ): Promise<BatchNftSale[] | undefined> => {
            if (!checkArgs(identity, sales)) return undefined;
            console.debug('🚀 ~ identity:', identity);
            const price_icp = getBatchSellTotalPrice(sales, 'ICP');
            const price_ogy = getBatchSellTotalPrice(sales, 'OGY');
            throwIdentity(identity);

            if (record?.status === 'executing') {
                return undefined;
            }
            const id = await insert(identity.principal!, {
                type: 'batch-sell',
                args: { sales },
                actions: [],
            }).catch((e) => {
                message.error(e.message);
                return undefined;
            });
            if (!id) return;
            setId(id);

            larkNoticeBatchSellInitial(
                getBackendType(),
                id,
                identity.principal!,
                sales,
                `icp: ${price_icp},ogy: ${price_ogy || '0'}`,
                '',
            );
        },

        [insert, record],
    );

    return { batchSell, executing: record?.status === 'executing' };
};

export const useDoBatchSellNftByTransaction = (): BatchSellingByTransactionExecutor => {
    const checkIdentity = useCheckIdentity();

    const update = useTransactionStore((s) => s.update);

    const doAction = useDoAction<BatchSellingAction, any>();

    const [success, setSuccess] = useState<BatchNftSale[] | undefined>(undefined);

    const [failed, setFailed] = useState<BatchNftSale[] | undefined>(undefined);

    const doBatchSell = useCallback(
        async (id: string, created: number, transaction: BatchSellingTransaction) => {
            const identity = checkIdentity();
            throwIdentity(identity);
            const sales = transaction.args.sales;
            const price_icp = getBatchSellTotalPrice(sales, 'ICP');
            const price_ogy = getBatchSellTotalPrice(sales, 'OGY');
            try {
                if (!transaction_executing(id)) return;
                let done_action = false;
                const set_action_done = () => {
                    done_action = true;
                };
                const setAction = () => {};
                const lark_notice_before = function (action: BatchSellingAction): number {
                    return larkNoticeBatchSell(0, getBackendType(), id, action ?? '');
                };
                const lark_notice_after = function (
                    now: number,
                    action: BatchSellingAction,
                    data?: any,
                ): void {
                    larkNoticeBatchSell(
                        now,
                        getBackendType(),
                        id,
                        action ?? '',
                        data ? `${JSON.stringify(data)}` : undefined,
                    );
                };
                const spend = Spend.start(
                    `batch sell nfts ${sales.map((s) => uniqueKey(s.token_id)).join('|')}`,
                );

                await checkWhitelist(identity, [...sales.map((item) => item.token_id.collection)]);

                await doAction('DOING', transaction, {
                    fetch_action: async () => {},
                    do_action: async () => {
                        transaction.actions.push({
                            action: 'DOING',
                            timestamp: Date.now(),
                        });
                        await update(id, transaction, 'executing');
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });
                if (done_action) return;

                await doAction('BATCH_APPROVING', transaction, {
                    fetch_action: async () => {},
                    do_action: async () => {
                        const success: BatchNftSale[] = [];
                        const failed: BatchNftSale[] = [];
                        await doBatchApproving(
                            setAction,
                            success,
                            failed,
                            setSuccess,
                            setFailed,
                            identity,
                            sales,
                            spend,
                        );
                        transaction.actions.push({
                            action: 'BATCH_APPROVING',
                            timestamp: Date.now(),
                            data: {
                                success,
                                failed,
                            },
                        });
                        await update(id, transaction, 'executing');
                        return {
                            success: success.map((s) => uniqueKey(s.token_id)),
                            failed: failed.map((s) => uniqueKey(s.token_id)),
                        };
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });
                if (done_action) return;

                await doAction('BATCH_yuku_LISTING', transaction, {
                    fetch_action: async () => {},
                    do_action: async () => {
                        const success = _.findLast(
                            transaction.actions,
                            (i) => i.action === 'BATCH_APPROVING',
                        )?.data.success;
                        await doYukuRecord(setAction, success, identity, spend);
                        transaction.actions.push({
                            action: 'BATCH_yuku_LISTING',
                            timestamp: Date.now(),
                            data: {
                                success,
                            },
                        });
                        await update(id, transaction, 'successful');
                        return {
                            success: success.map((s) => uniqueKey(s.token_id)),
                        };
                    },
                    set_action_done,
                    spend,
                    lark_notice_before,
                    lark_notice_after,
                });

                larkNoticeBatchSellOver(
                    created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.sales,
                    `icp: ${price_icp},ogy: ${price_ogy || '0'}`,
                    `Actions: ${transaction.actions
                        .map((a) => {
                            if (!a.action) {
                                return;
                            }
                            if (!['BATCH_APPROVING', 'BATCH_yuku_LISTING'].includes(a.action)) {
                                return `${a.action}(${a.timestamp})${
                                    a.data ? `: ${JSON.stringify(a.data)}` : ''
                                }`;
                            } else {
                                return `${a.action}(${a.timestamp})${
                                    a.data
                                        ? `: ${JSON.stringify(
                                              a.data.success.map((s) => uniqueKey(s.token_id)),
                                          )}${JSON.stringify(
                                              a.data.failed?.map((s) => uniqueKey(s.token_id)),
                                          )}`
                                        : ''
                                }`;
                            }
                        })
                        .join('\n\t')}`,
                );
            } catch (e: any) {
                const message = `${e.message ?? e}`;
                const log_error = !ERRS_NOT_SEND.find((m) => message.indexOf(m) !== -1);

                larkNoticeBatchSellFailed(
                    created,
                    getBackendType(),
                    id,
                    identity.principal!,
                    transaction.args.sales,
                    `Actions: ${transaction.actions
                        .map((a) => {
                            let n_data;
                            if (a.data) {
                                n_data = { ...a.data };
                                if (n_data.collections) {
                                    delete n_data.collections;
                                }
                            }
                            return `${a.action}(${a.timestamp})${
                                n_data ? `: ${JSON.stringify(n_data)}` : ''
                            }`;
                        })
                        .join('\n\t')}`,
                    message,
                    log_error,
                );
                await update(id, transaction, 'failed', message);
            } finally {
                transaction_executed(id);
            }
        },
        [checkIdentity, doAction, update, success, failed],
    );
    return doBatchSell;
};

const checkArgs = (identity: ConnectedIdentity, sales: BatchNftSale[]): boolean => {
    const owner_account = identity.account;
    for (const o of sales) {
        if (o.owner.owner !== owner_account) {
            message.warning(`You can't sell NFT that you are not owned`);
            return false;
        }
    }

    if (_.uniq(sales.map((o) => o.token_id).map(uniqueKey)).length < sales.length) {
        message.warning(`NFT is repeated`);
        return false;
    }

    return true;
};

const checkBatchWhiteList = async (
    setAction: (action: BatchSellingAction) => void,
    spend: Spend,
): Promise<void> => {
    setAction('BATCH_WHITELIST');

    spend.mark(`BATCH_WHITELIST DONE`);
};

const doBatchApproving = async (
    setAction: (action: BatchSellingAction) => void,
    success: BatchNftSale[],
    failed: BatchNftSale[],
    setSuccess: (success: BatchNftSale[]) => void,
    setFailed: (failed: BatchNftSale[]) => void,
    identity: ConnectedIdentity,
    sales: BatchNftSale[],
    spend: Spend,
): Promise<void> => {
    setAction('BATCH_APPROVING');
    setSuccess(success);
    setFailed(failed);
    await doBatchApprove(identity, sales, (sale) => {
        if (sale.result === '') {
            success.push(sale);
            setSuccess([...success]);
        } else if (sale.result) {
            failed.push(sale);
            setFailed([...failed]);
        }
    });
    spend.mark(`BATCH_APPROVING DONE`);
};

const doBatchApprove = async (
    identity: ConnectedIdentity,
    sales: BatchNftSale[],
    update: (sale: BatchNftSale) => void,
): Promise<void> => {
    await Promise.all(sales.map((sale) => doSell(identity, sale, update)));
};

const doSell = async (
    identity: ConnectedIdentity,
    sale: BatchNftSale,
    update: (sale: BatchNftSale) => void,
): Promise<void> => {
    try {
        const spend = Spend.start(`batch sell: approve ${uniqueKey(sale.owner.token_id)}`);
        await doApprove(identity, sale.owner, () => {}, spend);
        spend.mark(`over: ${sale.owner.raw.standard}`);
        sale.result = '';
        update(sale);
    } catch (e) {
        console.error(`batch sell: approve ${uniqueKey(sale.owner.token_id)} failed`, e);
        sale.result = `${e}`;
        update(sale);
    }
};

const doYukuRecord = async (
    setAction: (action: BatchSellingAction) => void,
    success: BatchNftSale[],
    identity: ConnectedIdentity,
    spend: Spend,
): Promise<void> => {
    setAction('BATCH_yuku_LISTING');
    const args = success
        .filter((item) => item.owner.raw.standard !== 'ogy')
        .map((sale) => ({
            token_identifier: sale.owner.token_id.token_identifier,
            token: sale.token,
            price: sale.price,
        }));

    let records: string[] = [];
    if (args.length) {
        records = await batchListing(identity!, args);
    }
    spend.mark(`BATCH_yuku_LISTING DONE`);

    success.forEach((sale) => {
        if (
            sale.owner.raw.standard !== 'ogy' &&
            !records.includes(sale.owner.token_id.token_identifier)
        ) {
            sale.result = 'Yuku listing failed';
        }
    });
};
