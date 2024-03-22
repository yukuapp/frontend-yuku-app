import { NftTokenMetadata, NftTokenOwner } from '@/types/nft';
import { NftTokenScore } from '@/types/nft';
import { CccProxyNft } from '@/types/nft-standard/ccc';
import { getAllCccProxyNfts } from '../canisters/yuku-old/ccc_proxy';
import { CombinedStore, MemoryStore } from '../stored';

const ccc_proxy_memory = new MemoryStore<CccProxyNft[]>(1000 * 5, false);
const cccProxyNftsStored = {
    getItem: (): CccProxyNft[] | undefined => ccc_proxy_memory.getItem(''),
    setItem: (records: CccProxyNft[]) => ccc_proxy_memory.setItem('', records),
};
export const getCccProxyNfts = async (): Promise<CccProxyNft[]> => {
    let cached = cccProxyNftsStored.getItem();
    if (cached === undefined) {
        cached = await getAllCccProxyNfts();
        cccProxyNftsStored.setItem(cached);
    }
    return cached;
};

export const collectionTokenOwnersStored = new CombinedStore<NftTokenOwner[]>(1000 * 60, true, {
    key_name: `__yuku_collection_token_owners_keys__`,
    indexed_key: (collection: string) => `__yuku_collection_token_owners_${collection}__`,
});

export const collectionTokenMetadataStored = new CombinedStore<NftTokenMetadata[]>(
    1000 * 3600 * 24 * 7,
    true,
    {
        key_name: `__yuku_collection_token_metadata_keys__`,
        indexed_key: (collection: string) => `__yuku_collection_token_metadata_${collection}__`,
    },
);

export const collectionTokenScoresStored = new CombinedStore<NftTokenScore[]>(
    1000 * 3600 * 24 * 7,
    true,
    {
        key_name: `__yuku_collection_token_scores_keys__`,
        indexed_key: (collection: string) => `__yuku_collection_token_scores_${collection}__`,
    },
);
