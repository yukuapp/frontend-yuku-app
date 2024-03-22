import { NftIdentifier, TokenInfo, YukuListingNftStandard } from '../nft';
import { TransactionAction } from './common';

export type BuyingAction =
    | undefined
    | 'DOING'
    | 'CHECKING_BALANCE'
    | 'CREATING_ORDER'
    | 'PAY'
    | 'SUBMITTING_HEIGHT'
    | undefined
    | 'DOING'
    | 'CHECKING_BALANCE'
    | 'OGY_QUERY_PAY_ACCOUNT'
    | 'PAY'
    | 'OGY_BID_NFT'
    | 'OGY_BID_NFT_SUCCESS'
    | undefined
    | 'DOING'
    | 'CHECKING_BALANCE'
    | 'ENTRE_LOCK_PAY_ACCOUNT'
    | 'PAY'
    | 'SETTLE'
    | 'SUCCESS';

export type BuyNftRawOgy = {
    standard: 'ogy';
    sale_id: string;
    broker_id?: string;
    seller: string; // ? principal -> string
};

export type BuyNftRawEntrepot = {
    standard: 'entrepot';
    token_id: NftIdentifier;
    price: string;
};

export type BuyNftRaw = { standard: YukuListingNftStandard } | BuyNftRawOgy | BuyNftRawEntrepot;

export type BuyNftExecutor = (
    token_id: NftIdentifier,
    owner: string | undefined,
    token: TokenInfo,
    price: string,
    raw: BuyNftRaw,
) => Promise<boolean>;

export type SingleBuyAction<T> = TransactionAction<BuyingAction, T>;

export type SingleBuyTransaction = {
    type: 'single-buy';
    args: {
        token_id: NftIdentifier;
        owner: string;
        token: TokenInfo;
        price: string;
        raw: BuyNftRaw;
    };
    actions: SingleBuyAction<any>[];
    paid: number;
};

export type BuyNftByTransactionExecutor = (
    id: string,
    created: number,
    transaction: SingleBuyTransaction,
    manual: boolean,
) => Promise<void>;
