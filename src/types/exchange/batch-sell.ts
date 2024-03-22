import { ConnectedIdentity } from '../identity';
import { BatchNftSale } from '../yuku';
import { TransactionAction } from './common';

export type BatchSellingAction =
    | undefined
    | 'DOING'
    | 'BATCH_WHITELIST'
    | 'BATCH_APPROVING'
    | 'BATCH_yuku_LISTING';

export type BatchSellNftExecutor = (
    identity: ConnectedIdentity,
    sales: BatchNftSale[],
) => Promise<BatchNftSale[] | undefined>;

export type BatchSellingTransactionAction<T> = TransactionAction<BatchSellingAction, T>;

export type BatchSellingTransaction = {
    type: 'batch-sell';
    args: {
        sales: BatchNftSale[];
    };
    actions: BatchSellingTransactionAction<any>[];
};

export type BatchSellingByTransactionExecutor = (
    id: string,
    created: number,
    transaction: BatchSellingTransaction,
) => Promise<void>;
