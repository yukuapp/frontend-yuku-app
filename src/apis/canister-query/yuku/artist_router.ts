import { ArtistCollectionData } from '@/types/yuku';
import { CANISTER_QUERY_HOST } from '../host';
import { canister_query } from '../query';

export const canisterQueryYukuArtistCollectionIdList = async (
    backend_canister_id: string,
): Promise<string[] | undefined> =>
    canister_query(
        `${CANISTER_QUERY_HOST}/yuku/artist_router/${backend_canister_id}/collection_id`,
    );

export const canisterQueryYukuArtistCollectionDataList = async (
    backend_canister_id: string,
): Promise<ArtistCollectionData[] | undefined> =>
    canister_query(
        `${CANISTER_QUERY_HOST}/yuku/artist_router/${backend_canister_id}/collection_data`,
    );
