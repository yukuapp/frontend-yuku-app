import { uniqueKey } from '@/common/nft/identifier';
import { NftListingData } from '@/types/listing';
import { NftIdentifier } from '@/types/nft';
import { MemoryStore } from '../stored';

const nft_list_memory = new MemoryStore<NftListingData>(1000 * 60 * 60 * 24 * 365, false);
export const putMemoryNftListing = (token_id: NftIdentifier, listing: NftListingData) =>
    nft_list_memory.setItem(uniqueKey(token_id), listing);
export const fetchMemoryNftListing = (token_id: NftIdentifier): NftListingData | undefined =>
    nft_list_memory.getItem(uniqueKey(token_id));
export const removeMemoryNftListing = (token_id: NftIdentifier) =>
    nft_list_memory.removeItem(uniqueKey(token_id));
