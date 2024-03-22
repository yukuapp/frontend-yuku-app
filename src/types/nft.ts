import { NftListingData } from './listing';
import { NftTokenOwnerMetadataCcc } from './nft-standard/ccc';
import { NftTokenOwnerMetadataExt } from './nft-standard/ext';
import { NftTokenOwnerMetadataIcnaming } from './nft-standard/icnaming';
import { NftTokenOwnerMetadataOgy } from './nft-standard/ogy';
import { UniqueCollectionData } from './yuku';

// ===================== Supported NFT Standards =====================

// NFTs listed on yuku
export type YukuListingNftStandard = 'ext' | 'ccc' | 'icnaming' | 'shiku_land';

export type SupportedNftStandard =
    | YukuListingNftStandard
    | 'ogy' // OGY with its own exchange, must be traded within this jar
    | 'ext' // EXT also has an exchange, use as needed
    | 'entrepot'; // NFTs on entrepot also have an exchange, use as needed

// ===================== Specify Units for Money =====================

export type TokenStandard =
    | {
          type: 'Ledger' | 'ICRC1' | 'DIP20' | 'EXTFungible';
          raw?: undefined;
      }
    | {
          type: 'Other';
          raw: string;
      };
export type TokenInfo = {
    id?: string; // ? bigint -> string
    symbol: string;
    canister: string; // ? principal -> string
    standard: TokenStandard;
    decimals: string; // ? bigint -> string
    fee?: string; // ? bigint -> string
};

// ===================== NFT Identifier =====================

export type NftIdentifier = {
    collection: string; // ? principal -> string
    token_identifier: string;
};

// ===================== NFT Owner =====================

export type NftTokenOwner = {
    token_id: NftIdentifier;
    owner: string; // account hex
    raw:
        | { standard: 'ext'; data: NftTokenOwnerMetadataExt } // may carry additional information
        | { standard: 'ccc'; data: NftTokenOwnerMetadataCcc }
        | { standard: 'ogy'; data: NftTokenOwnerMetadataOgy }
        | { standard: 'icnaming'; data: NftTokenOwnerMetadataIcnaming };
};

// ===================== NFT Metadata =====================

export type NftMetadataTrait = {
    name: string;
    value: string;
};

// Basic information
type BasicNftMetadata = {
    name: string; // NFT name
    mimeType: string; // NFT data type
    url: string;
    thumb: string; // thumbnail
    description: string; // description
    traits: NftMetadataTrait[]; // features
    onChainUrl: string; // on-chain data
    yuku_traits: NftMetadataTrait[]; // traits defined by yuku
};

export type NftTokenMetadata = {
    token_id: NftIdentifier;
    metadata: BasicNftMetadata;
    raw: { standard: SupportedNftStandard; data: string };
};

// ===================== NFT Rarity Information =====================

export type NftTokenScore = {
    token_id: NftIdentifier;
    score: {
        value: number;
        order: number; // sorting
    };
    raw: { standard: SupportedNftStandard; data?: string };
};

// ===================== All NFT Information =====================

export type NftMetadata = {
    data?: UniqueCollectionData; // some NFTs do not require data
    owner: NftTokenOwner; // ownership
    metadata: NftTokenMetadata; // metadata
    listing?: NftListingData; // listing information
    score?: NftTokenScore; // rarity information
};
