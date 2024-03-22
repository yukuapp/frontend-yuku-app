import { NftIdentifier, TokenInfo } from './nft';
import { ExtUser } from './nft-standard/ext';

export type ListingFee = {
    platform: string;
    royalties: string;
};

export type NftListingHolding = {
    type: 'holding';
};

export type NftListingListing = {
    type: 'listing';
    time?: string;
    token: TokenInfo;
    price: string;
    raw:
        | {
              type: 'yuku';
              token_identifier: string;
              seller: string;
              fee: ListingFee;
          }
        | {
              type: 'ogy';
              sale_id: string;
              raw: string;
          }
        | {
              type: 'entrepot'; //
              token_identifier: string;
          };
};
export type NftListingAuction = {
    type: 'auction';
    time: string;
    token_identifier: string;
    seller: string;
    fee: ListingFee;
    auction: {
        ttl: string;
        start: string;
        abort?: string;
        highest?: {
            price: string;
            bidder: string;
        };
    };
};
export type NftListingDutchAuction = {
    type: 'dutch';
    time: string;
    token_identifier: string;
    seller: string;
    token: TokenInfo;
    fee: ListingFee;
    auction: {
        time: {
            start: string;
            end: string;
            reduce: string;
        };
        price: {
            start: string;
            floor: string;
            reduce: string;
        };
        payee: ExtUser;
    };
};

export type NftListing =
    | NftListingHolding
    | NftListingListing
    | NftListingAuction
    | NftListingDutchAuction;

export type NftListingData = {
    token_id: NftIdentifier;

    views?: string;
    favorited?: string[];
    latest_price?: string;

    listing: NftListing;

    raw: string;
};
