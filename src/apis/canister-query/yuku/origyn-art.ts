import { OrigynArtCollectionData } from '@/canisters/yuku-old/yuku_origyn_art';
import { CANISTER_QUERY_HOST } from '../host';
import { canister_query } from '../query';

export const canisterQueryYukuOrigynArtCollectionIdList = async (
    backend_canister_id: string,
): Promise<string[] | undefined> =>
    canister_query(`${CANISTER_QUERY_HOST}/yuku/origyn-art/${backend_canister_id}/collection_id`);

export const canisterQueryYukuOrigynArtCollectionDataList = async (
    backend_canister_id: string,
): Promise<OrigynArtCollectionData[] | undefined> =>
    canister_query(`${CANISTER_QUERY_HOST}/yuku/origyn-art/${backend_canister_id}/collection_data`);
