import { NftIdentifier, TokenInfo } from '../nft';

export type BiddingShikuAction =
    | undefined
    | 'DOING'
    | 'CHECKING_OFFER_ID'
    | 'CHECKING_PAY_ACCOUNT'
    | 'CHECKING_PAY_ACCOUNT_BALANCE'
    | 'CHECKING_BALANCE'
    | 'PAY'
    | 'MAKE_OFFER'
    | 'UPDATE_OFFER';

export type BidShikuNftExecutor = (
    token_id: NftIdentifier,
    owner: string,
    token: TokenInfo,
    price: string,
    ttl: string,
) => Promise<boolean>;
