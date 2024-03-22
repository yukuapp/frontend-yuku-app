import { NftListing } from './listing';
import { NftIdentifier, NftMetadata, NftTokenOwner, TokenInfo, TokenStandard } from './nft';
import { OgyCandyValue_2f2a0ab9 } from './nft-standard/ogy-candy';

export type SupportedChain = 'InternetComputer' | 'Bitcoin';

export type YukuResponse<T> = {
    code: number;
    message: string;
    data?: T;
};

// KYC Result
export type KycResult = {
    principal: string;
    level: 'NA' | 'Tier1' | 'Tier2' | 'Tier3';
    status?: 'pending';
    quota: number;
    used: number;
};

// Token information in yuku collection details
export type CollectionStandardOgyInfoTokenIC = {
    fee?: string;
    decimals: string;
    canister: string;
    standard: TokenStandard;
    symbol: string;
};

// Token information in yuku collection details
export type CollectionStandardOgyInfoToken =
    | { ic: CollectionStandardOgyInfoTokenIC; extensible?: undefined }
    | { ic?: undefined; extensible: OgyCandyValue_2f2a0ab9 };

type CollectionStandardOgyInfo = {
    creator: string;
    owner: string;
    token: CollectionStandardOgyInfoToken;
    fee: {
        rate: string;
        precision: string;
    };
    totalFee: {
        rate: string;
        precision: string;
    };
};

export type CollectionStandard =
    | { ext: null; ogy?: undefined }
    | { ext?: undefined; ogy: CollectionStandardOgyInfo };

// Link information in yuku collection details
export type CollectionLinks = {
    twitter?: string;
    medium?: string;
    discord?: string;
    website?: string;
    instagram?: string;
    telegram?: string;
};

// yuku collection details
export interface CollectionInfo {
    collection: string;
    creator: string;
    standard: CollectionStandard;
    royalties: string;
    isVisible: boolean;
    name: string;
    category?: string;
    description?: string;
    featured?: string;
    logo?: string;
    banner?: string;
    links?: CollectionLinks;
    releaseTime?: string;
    url?: string;
}

// yuku collection creator information
export type CollectionCreator = {
    userId: string;
    username: string;
    avatar: string;
    bio: string;
    time: string;
};

// yuku collection listing information
export type Listings = {
    tokenIdentifier: string;
    price: string;
};

export type CollectionMetadata = {
    listings: Array<Listings>;
    tradeCount: string;
    createTime: string;
    floorPrice: string;
    volumeTrade: string;
};

// yuku collection metadata information
export type CoreCollectionData = {
    info: CollectionInfo;
    creator?: CollectionCreator;
    metadata?: CollectionMetadata;
};

// yuku collection metadata information
export type ArtistCollectionData = {
    info: CollectionInfo;
    creator?: CollectionCreator;
    metadata?: CollectionMetadata;
};

// yuku collection metadata information
export type UniqueCollectionData = CoreCollectionData | ArtistCollectionData;

// yuku batch NFT sale record
export type BatchNftSale = {
    token_id: NftIdentifier;
    card?: NftMetadata;
    owner: NftTokenOwner;
    token: TokenInfo;
    last: string | undefined;
    price: string;
    result?: string;
};

// yuku shopping cart item
export type ShoppingCartItem = {
    token_id: NftIdentifier;
    card?: NftMetadata;
    listing?: NftListing;
};
