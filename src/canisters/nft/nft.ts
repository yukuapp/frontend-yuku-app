import { ConnectedIdentity } from '@/types/identity';
import { NftTokenMetadata, NftTokenOwner, NftTokenScore } from '@/types/nft';
import { CccProxyNft } from '@/types/nft-standard/ccc';
import { CoreCollectionData } from '@/types/yuku';
import {
    queryAllTokenMetadataByCcc,
    queryAllTokenOwnersByCcc,
    queryCollectionNftMinterByCcc,
} from './nft_ccc';
import {
    queryAllTokenMetadataByExt,
    queryAllTokenOwnersByExt,
    queryAllTokenScoresByExt,
    queryCollectionNftMinterByExt,
    queryOwnerTokenMetadataByExt,
    querySingleTokenMetadataByExt,
    querySingleTokenOwnerByExt,
} from './nft_ext';
import {
    queryAllTokenMetadataByIcnaming,
    queryAllTokenOwnersByIcnaming,
    queryCollectionNftMinterByIcnaming,
    querySingleTokenMetadataByIcnaming,
    querySingleTokenOwnerByIcnaming,
} from './nft_icnaming';
import { NFT_CCC, NFT_EXT_WITHOUT_APPROVE, NFT_ICNAMING, replaceOrigin } from './special';

// =========================== Query all token owners for all standards ===========================

// Each standard requires a different method
export const queryAllTokenOwners = async (
    identity: ConnectedIdentity,
    collection: string,
    fetchProxyNftList: () => Promise<CccProxyNft[]>,
): Promise<NftTokenOwner[]> => {
    const r: NftTokenOwner[] = await (async () => {
        try {
            // If it is the CCC standard
            if (NFT_CCC.includes(collection)) {
                return await queryAllTokenOwnersByCcc(identity, collection, fetchProxyNftList);
            }
            // If it is the ICNAMING standard
            if (NFT_ICNAMING.includes(collection)) {
                return await queryAllTokenOwnersByIcnaming(identity, collection);
            }
            // Default to the EXT standard
            const r = await queryAllTokenOwnersByExt(identity, collection, fetchProxyNftList);
            // console.log('queryAllTokenOwners', collection, r);
            return r;
        } catch (e: any) {
            console.log('queryAllTokenOwners', collection, e.message);
            return [];
        }
    })();
    return r.filter((n) => n.owner !== ''); // ! Convention: If the owner value is '', it means it has been destroyed and should not be displayed
};

// Query all token metadata for all standards
// Each standard requires a different method
export const queryAllTokenMetadata = async (
    identity: ConnectedIdentity,
    collection: string,
    token_owners: NftTokenOwner[],
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            return await queryAllTokenMetadataByCcc(
                identity,
                collection,
                token_owners,
                collection_data,
            );
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await queryAllTokenMetadataByIcnaming(
                identity,
                collection,
                token_owners,
                collection_data,
            );
        }

        // Default to the EXT standard
        const r = await queryAllTokenMetadataByExt(
            identity,
            collection,
            token_owners,
            collection_data,
        );
        replaceOrigin(collection, r);
        // console.log('queryAllTokenMetadata', collection, r);
        return r;
    } catch (e: any) {
        console.log('queryAllTokenMetadata', collection, e.message, e);
        return [];
    }
};

// Query the rarity of all tokens for all standards
// Some EXT standards do not have the getScore interface
const CANISTER_NO_GET_SCORE = [
    'q2elr-eaaaa-aaaah-abwwq-cai',
    'kafas-uaaaa-aaaao-aaofq-cai',
    'y5cyv-vaaaa-aaaah-abxaq-cai',
    'a2laq-5qaaa-aaaah-abv3q-cai',
    'wekml-7yaaa-aaaah-abwca-cai',
    'n46fk-6qaaa-aaaai-ackxa-cai',
    'ujnhf-3yaaa-aaaag-qcj6q-cai', // Also no getRegister
    'xpegl-kaaaa-aaaah-abcrq-cai',
    'bqeck-7aaaa-aaaah-abv4q-cai',
    '4pwl6-pyaaa-aaaah-abpaa-cai',
    '5fzje-niaaa-aaaah-abpha-cai',
    'upr6o-taaaa-aaaah-abowq-cai',
    '6op7h-lqaaa-aaaah-abpnq-cai',
    '53lcn-vyaaa-aaaah-ab4mq-cai',
    's7la6-viaaa-aaaah-abrgq-cai',
    'ripyo-cqaaa-aaaah-abolq-cai',
    'yubtj-diaaa-aaaah-abxba-cai',
    '3rvic-6aaaa-aaaah-abxkq-cai',
    '2szbe-kyaaa-aaaah-abxma-cai',
    '23m62-2qaaa-aaaah-abiia-cai',
];

export const queryAllTokenScores = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<NftTokenScore[]> => {
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            return []; // No rarity
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return []; // No rarity
        }

        // Some EXT standards do not have the getScore interface
        if (
            CANISTER_NO_GET_SCORE.includes(collection) ||
            NFT_EXT_WITHOUT_APPROVE.includes(collection) // None of these have getScore
        ) {
            console.log(`canister ${collection} has no query method 'getScore'`);
            return [];
        }

        // Default to the EXT standard
        const r = await queryAllTokenScoresByExt(identity, collection);
        // console.log('queryAllTokenScores', collection, r);
        return r;
    } catch (e: any) {
        console.log('queryAllTokenScores', collection, e.message);
        return [];
    }
};

// Query the token metadata of the specified owner for EXT standards
const CANISTER_NO_TOKENS_EXT = [
    'xzrh4-zyaaa-aaaaj-qagaa-cai', // NFT gaga canister, already removed
];

export const queryOwnerTokenMetadata = async (
    identity: ConnectedIdentity,
    collection: string,
    account: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata[]> => {
    // If it is the CCC standard
    if (NFT_CCC.includes(collection)) {
        throw new Error("ccc nft has no query method 'tokens_ext'");
    }
    // If it is the ICNAMING standard
    if (NFT_ICNAMING.includes(collection)) {
        throw new Error("icnaming nft has no query method 'tokens_ext'");
    }

    // Some EXT standards do not have the tokens_ext interface
    if (CANISTER_NO_TOKENS_EXT.includes(collection)) {
        throw new Error(`canister ${collection} has no query method 'tokens_ext'`);
    }

    try {
        // Default to the EXT standard
        const r = await queryOwnerTokenMetadataByExt(
            identity,
            collection,
            account,
            collection_data,
        );
        // console.log('queryOwnerTokenMetadata', collection, r);
        return r;
    } catch (e: any) {
        console.log('queryOwnerTokenMetadata', collection, e.message);
        throw e;
    }
};

// Query the token metadata of the specified NFT
export const querySingleTokenMetadata = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
    collection_data?: CoreCollectionData,
): Promise<NftTokenMetadata> => {
    // If it is the CCC standard
    if (NFT_CCC.includes(collection)) {
        throw new Error("ccc nft has no query method 'metadata'");
    }

    try {
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await querySingleTokenMetadataByIcnaming(
                identity,
                collection,
                token_identifier,
                collection_data,
            );
        }

        // Default to the EXT standard
        const r = await querySingleTokenMetadataByExt(
            identity,
            collection,
            token_identifier,
            collection_data,
        );
        // console.log('querySingleTokenMetadata', collection, r);
        return r;
    } catch (e) {
        console.log('querySingleTokenMetadata', collection, `${e}`);
        throw e;
    }
};

// Query the owner of the specified NFT
export const querySingleTokenOwner = async (
    identity: ConnectedIdentity,
    collection: string,
    token_identifier: string,
): Promise<string> => {
    // If it is the CCC standard
    if (NFT_CCC.includes(collection)) {
        throw new Error("ccc nft has no query method 'metadata'");
    }

    try {
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await querySingleTokenOwnerByIcnaming(identity, collection, token_identifier);
        }

        // Default to the EXT standard
        const r = await querySingleTokenOwnerByExt(identity, collection, token_identifier);
        // console.log('querySingleTokenOwner', collection, r);
        return r;
    } catch (e) {
        console.log('querySingleTokenOwner', collection, `${e}`);
        throw e;
    }
};

// Get the minter of the collection
export const queryCollectionNftMinter = async (
    identity: ConnectedIdentity,
    collection: string,
): Promise<string> => {
    try {
        // If it is the CCC standard
        if (NFT_CCC.includes(collection)) {
            return await queryCollectionNftMinterByCcc(identity, collection);
        }
        // If it is the ICNAMING standard
        if (NFT_ICNAMING.includes(collection)) {
            return await queryCollectionNftMinterByIcnaming(identity, collection);
        }

        // Default to the EXT standard
        const r = await queryCollectionNftMinterByExt(identity, collection);
        // console.log('querySingleTokenOwner', collection, r);
        return r;
    } catch (e) {
        console.log('queryCollectionNftMinter', collection, `${e}`);
        throw e;
    }
};
