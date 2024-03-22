import {
    canisterQueryNftCollectionMetadata,
    canisterQueryNftCollectionScores,
} from '@/apis/canister-query/nft/collection';
import { replaceOrigin } from '@/canisters/nft/special';
import { NftTokenMetadata, NftTokenOwner, NftTokenScore } from '@/types/nft';
import { UniqueCollectionData } from '@/types/yuku';
import {
    queryAllTokenMetadata,
    queryAllTokenOwners,
    queryAllTokenScores,
} from '../canisters/nft/nft';
import {
    collectionTokenMetadataStored,
    collectionTokenOwnersStored,
    collectionTokenScoresStored,
} from '../stores/collection.stored';

export const getTokenOwners = async (
    collection: string,
    from: 'stored' | 'stored_remote' | 'remote',
): Promise<NftTokenOwner[] | undefined> => {
    switch (from) {
        case 'stored':
            return collectionTokenOwnersStored.getItem(collection);
        case 'stored_remote': {
            let stored = await collectionTokenOwnersStored.getItem(collection);
            if (stored === undefined) {
                stored = await queryAllTokenOwners(collection);
                collectionTokenOwnersStored.setItem(collection, stored);
            }
            return stored;
        }
        case 'remote': {
            const token_owners = await queryAllTokenOwners(collection);
            collectionTokenOwnersStored.setItem(collection, token_owners);
            return token_owners;
        }
    }
    throw new Error(`what a from: ${from}`);
};

export const getTokenMetadata = async (
    collection: string,
    option:
        | { from: 'stored'; token_owners: NftTokenOwner[] }
        | { from: 'stored_remote'; token_owners: NftTokenOwner[]; data?: UniqueCollectionData }
        | { from: 'remote'; token_owners: NftTokenOwner[]; data?: UniqueCollectionData },
): Promise<NftTokenMetadata[] | undefined> => {
    switch (option.from) {
        case 'stored': {
            const stored = await collectionTokenMetadataStored.getItem(collection);
            if (stored?.length === option.token_owners.length) return stored;
            return undefined;
        }
        case 'stored_remote': {
            let stored = await collectionTokenMetadataStored.getItem(collection);
            if (stored === undefined) {
                stored = await canisterQueryNftCollectionMetadata(collection);
                if (stored) collectionTokenMetadataStored.setItem(collection, stored);
            }
            if (stored?.length !== option.token_owners.length) stored = undefined;
            if (stored === undefined) {
                stored = await queryAllTokenMetadata(collection, option.token_owners, option.data);

                collectionTokenMetadataStored.setItem(collection, stored);
            }
            replaceOrigin(collection, stored);
            return stored;
        }

        case 'remote': {
            const data = await queryAllTokenMetadata(collection, option.token_owners, option.data);
            collectionTokenMetadataStored.setItem(collection, data);
            return data;
        }
    }
    throw new Error(`what a option: ${option}`);
};

export const getTokenScores = async (
    collection: string,
    option:
        | { from: 'stored'; token_owners?: NftTokenOwner[] }
        | { from: 'stored_remote'; token_owners?: NftTokenOwner[] }
        | { from: 'remote' },
): Promise<NftTokenScore[] | undefined> => {
    switch (option.from) {
        case 'stored': {
            const stored = await collectionTokenScoresStored.getItem(collection);
            if (stored?.length === 0) return stored;
            if (!option.token_owners || stored?.length === option.token_owners.length)
                return stored;
            return undefined;
        }
        case 'stored_remote': {
            let stored = await collectionTokenScoresStored.getItem(collection);
            if (stored === undefined) {
                stored = await canisterQueryNftCollectionScores(collection);
                if (stored) collectionTokenScoresStored.setItem(collection, stored);
            }
            if (stored?.length === 0) return stored;

            // if (option.token_owners && (stored?.length ?? 0) < option.token_owners.length)

            if (stored === undefined) {
                stored = await queryAllTokenScores(collection);

                const partial =
                    option.token_owners && stored && stored.length < option.token_owners.length;
                collectionTokenScoresStored.setItem(
                    collection,
                    stored,

                    partial ? Date.now() + 1000 * 60 * 5 : undefined,
                );
            }
            return stored;
        }
        case 'remote': {
            const stored = await queryAllTokenScores(collection);
            collectionTokenScoresStored.setItem(collection, stored);
            return stored;
        }
    }
    throw new Error(`what a option: ${option}`);
};
