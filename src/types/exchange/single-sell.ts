import { ConnectedIdentity } from '../identity';
import { NftTokenOwner, TokenInfo } from '../nft';
import { TransactionAction } from './common';

export type SellingAction =
    | undefined
    | 'DOING'
    | 'APPROVING'
    | 'APPROVING_EXT'
    | 'APPROVING_EXT_CHECKING'
    | 'APPROVING_EXT_APPROVING'
    | 'APPROVING_EXT_CHECKING_AGAIN'
    | 'yuku_LISTING'
    | undefined
    | 'DOING'
    | 'APPROVING'
    | 'APPROVING_CCC'
    | 'APPROVING_CCC_CHECKING_TRANSFERRED'
    | 'APPROVING_CCC_BEFORE_TRANSFERRING'
    | 'APPROVING_CCC_TRANSFERRING'
    | 'APPROVING_CCC_AFTER_TRANSFERRING'
    | 'yuku_LISTING'
    | undefined
    | 'DOING'
    | 'APPROVING'
    | 'APPROVING_OGY'
    | 'APPROVING_OGY_SUPPORTED_TOKEN'
    | 'APPROVING_OGY_CANCELLING'
    | 'APPROVING_OGY_SELLING';

export type SellNftExecutor = (
    identity: ConnectedIdentity,
    owner: NftTokenOwner,
    token: TokenInfo,
    price: string,
) => Promise<boolean>;

export type SingleSellAction<T> = TransactionAction<SellingAction, T>;

export type SingleSellTransaction = {
    type: 'single-sell';
    args: {
        owner: NftTokenOwner;
        token: TokenInfo;
        price: string;
    };
    actions: SingleSellAction<any>[];
};

export type SellNftByTransactionExecutor = (
    id: string,
    created: number,
    transaction: SingleSellTransaction,
) => Promise<void>;
