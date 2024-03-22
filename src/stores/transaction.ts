import { nanoid } from 'nanoid';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { getBackendType } from '@/utils/app/backend';
import { isDevMode } from '@/utils/app/env';
import { isSame } from '@/common/data/same';
import { BatchBuyingTransaction } from '@/types/exchange/batch-buy';
import { BatchSellingTransaction } from '@/types/exchange/batch-sell';
import { SingleBuyTransaction } from '@/types/exchange/single-buy';
import { SingleSellTransaction } from '@/types/exchange/single-sell';
import { SingleTransferTransaction } from '@/types/exchange/single-transfer';

const isDev = isDevMode();

export type Transaction =
    | SingleBuyTransaction
    | SingleSellTransaction
    | SingleTransferTransaction
    | BatchBuyingTransaction
    | BatchSellingTransaction;

export type TransactionRecord = {
    id: string;
    created: number;
    principal: string;
    transaction: Transaction;
    stopped: boolean;
    status?: 'executing' | 'successful' | 'failed';
    message?: string;
    modal: boolean;
};

export type RefreshFlags =
    | SingleBuyTransaction['type']
    | SingleSellTransaction['type']
    | SingleTransferTransaction['type']
    | BatchBuyingTransaction['type']
    | BatchSellingTransaction['type'];

const hasSameTransaction = (
    records: TransactionRecord[],
    principal: string,
    transaction: Transaction,
    duration: number,
): boolean => {
    const transactions = records.filter(
        (r) => r.principal === principal && isSame(r.transaction.args, transaction.args),
    );
    const now = Date.now();
    for (const t of transactions) {
        if (now < t.created + duration) return true;
    }
    return false;
};

interface TransactionState {
    records: Record<string, TransactionRecord[]>;
    flag: number;
    insert: (principal: string, transaction: Transaction) => Promise<string>;
    update: (
        id: string,
        transaction: Transaction,
        status: 'executing' | 'successful' | 'failed',
        message?: string,
    ) => Promise<void>;
    remove: (id: string) => Promise<void>;
    stop: (id: string) => void;
    go_on: (id: string) => void;
    toggle: (id: string) => void;
    refreshFlags: Record<RefreshFlags, number>;
    triggerRefresh: (type: RefreshFlags) => void;
}

export const useTransactionStore = create<TransactionState>()(
    devtools(
        persist(
            (set, get) => ({
                // showRecorder: false,
                // setShowRecorder: (show: boolean) => set({ showRecorder: show }),

                records: {},
                flag: 0,
                insert: async (principal: string, transaction: Transaction) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    const records = get().records[backendType];
                    if (hasSameTransaction(records, principal, transaction, 5000)) {
                        throw new Error(`already submitting`);
                    }
                    const id = nanoid();
                    if (transaction.type === 'batch-sell') {
                        records.push({
                            id,
                            created: Date.now(),
                            principal,
                            transaction: {
                                ...transaction,
                                args: {
                                    sales: transaction.args.sales.map((s) => ({
                                        ...s,
                                        card: undefined,
                                    })),
                                },
                            },
                            stopped: false,
                            modal: false,
                        });
                    } else {
                        records.push({
                            id,
                            created: Date.now(),
                            principal,
                            transaction,
                            stopped: false,
                            modal: false,
                        });
                    }
                    set({ records: { ...get().records, [backendType]: records } });
                    return id;
                },
                update: async (
                    id: string,
                    transaction: Transaction,
                    status: 'executing' | 'successful' | 'failed',
                    message?: string,
                ) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    const records = get().records[backendType];
                    const record = records.find((r) => r.id === id);
                    if (record === undefined) {
                        console.debug(`update:can not find transaction by id: ${id}`);
                        return;
                    }

                    record.transaction = { ...transaction };
                    record.status = status;
                    record.message = message;
                    if (status === 'successful') set({ flag: get().flag + 1 });
                    set({ records: { ...get().records } });
                },
                remove: async (id: string) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    let records = get().records[backendType];
                    const record = records.find((r) => r.id === id);
                    if (record === undefined) {
                        console.debug(`remove:can not find transaction by id: ${id}`);
                        return;
                    }
                    records = records.filter((r) => r.id !== id);
                    set({ records: { ...get().records, [backendType]: records } });
                },
                stop: (id: string) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    const records = get().records[backendType];
                    const record = records.find((r) => r.id === id);
                    if (record === undefined) {
                        console.debug(`remove:can not find transaction by id: ${id}`);
                        return;
                    }
                    record.stopped = true;
                    set({ records: { ...get().records, [backendType]: records } });
                },
                go_on: (id: string) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    const records = get().records[backendType];
                    const record = records.find((r) => r.id === id);
                    if (record === undefined) {
                        console.debug(`go_on:can not find transaction by id: ${id}`);
                        return;
                    }
                    record.stopped = false;
                    set({ records: { ...get().records, [backendType]: records } });
                },
                toggle: (id: string) => {
                    const backendType = getBackendType();
                    if (!get().records[backendType])
                        set({ records: { ...get().records, [backendType]: [] } });
                    const records = get().records[backendType];
                    const record = records.find((r) => r.id === id);
                    if (record === undefined) {
                        // throw new Error(`can not find transaction by id: ${id}`);
                        return;
                    }
                    record.modal = !record.modal;
                    set({ records: { ...get().records, [backendType]: records } });
                },
                refreshFlags: {
                    'single-buy': 0,
                    'single-sell': 0,
                    'single-transfer': 0,
                    'batch-buy': 0,
                    'batch-buy-gold': 0,
                    'batch-sell': 0,
                },
                triggerRefresh: (type: RefreshFlags) => {
                    const refreshFlags = get().refreshFlags;
                    refreshFlags[type]++;
                    set({ refreshFlags });
                },
            }),
            {
                name: '__yuku_transactions__',
            },
        ),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('TransactionStore', useTransactionStore);
