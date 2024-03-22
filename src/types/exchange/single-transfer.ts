import { ConnectedIdentity } from '../identity';
import { NftTokenOwner } from '../nft';
import { TransactionAction } from './common';

export type TransferringAction =
    | undefined
    | 'DOING'
    | 'RETRIEVING'
    | 'TRANSFERRING'
    | undefined
    | 'DOING'
    | 'RETRIEVING'
    | 'RETRIEVING_CCC'
    | 'TRANSFERRING';

export type TransferNftExecutor = (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    to: string,
    is_batch?: boolean,
) => Promise<boolean>;

export type SingleTransferAction<T> = TransactionAction<TransferringAction, T>;

export type SingleTransferTransaction = {
    type: 'single-transfer';
    args: {
        owner: NftTokenOwner;
        to: string;
    };
    actions: SingleTransferAction<any>[];
};

export type TransferNftByTransactionExecutor = (
    id: string,
    created: number,
    transaction: SingleTransferTransaction,
) => Promise<void>;
