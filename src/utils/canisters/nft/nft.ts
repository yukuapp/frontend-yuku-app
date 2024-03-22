import * as nft from '@/canisters/nft/nft';
import { NftTokenMetadata, NftTokenOwner, NftTokenScore } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';
import { anonymous } from '../../connect/anonymous';
import { getCccProxyNfts } from '../../stores/collection.stored';

export const queryAllTokenOwners = async (collection: string): Promise<NftTokenOwner[]> => {
    return nft.queryAllTokenOwners(anonymous, collection, getCccProxyNfts);
};

export const queryAllTokenMetadata = async (
    collection: string,
    token_owners: NftTokenOwner[],
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    return nft.queryAllTokenMetadata(anonymous, collection, token_owners, collection_data);
};

export const queryAllTokenScores = async (collection: string): Promise<NftTokenScore[]> => {
    return nft.queryAllTokenScores(anonymous, collection);
};

export const queryOwnerTokenMetadata = async (
    collection: string,
    account: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    return nft.queryOwnerTokenMetadata(anonymous, collection, account, collection_data);
};

export const querySingleTokenMetadata = async (
    collection: string,
    token_identifier: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata> => {
    return nft.querySingleTokenMetadata(anonymous, collection, token_identifier, collection_data);
};

export const querySingleTokenOwner = async (
    collection: string,
    token_identifier: string,
): Promise<string> => {
    return nft.querySingleTokenOwner(anonymous, collection, token_identifier);
};

export const queryCollectionNftMinter = async (collection: string): Promise<string> => {
    return nft.queryCollectionNftMinter(anonymous, collection);
};
