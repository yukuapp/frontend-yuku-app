import { LaunchpadCollectionInfo } from '@/canisters/yuku-old/yuku_launchpad';
import { TransactionAction } from './common';

export type LaunchpadBuyingAction =
    | undefined
    | 'DOING'
    | 'CHECKING_PURCHASE'
    | 'CHECKING_BALANCE'
    | 'PAY'
    | 'CLAIMING';

export type LaunchpadBuyAction<T> = TransactionAction<LaunchpadBuyingAction, T>;

export type LaunchpadBuyTransaction = {
    type: 'launchpad-buy';
    args: {
        count: number;
        info: LaunchpadCollectionInfo;
    };
    actions: LaunchpadBuyAction<any>[];
    paid: number;
};

export type LaunchpadBuyByTransactionExecutor = (
    id: string,
    created: number,
    transaction: LaunchpadBuyTransaction,
    manual: boolean,
) => Promise<void>;
