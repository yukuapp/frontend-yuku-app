import {
    canisterQueryYukuArtistCollectionDataList,
    canisterQueryYukuArtistCollectionIdList,
} from '@/apis/canister-query/yuku/artist_router';
import { ArtistCollectionData } from '@/types/yuku';
import {
    queryArtistCollectionDataListByBackend,
    queryArtistCollectionIdListByBackend,
} from '../../canisters/yuku-old/artist_router';

export const combinedQueryArtistCollectionIdList = async (
    backend_canister_id: string,
): Promise<string[]> =>
    new Promise((resolve, reject) => {
        canisterQueryYukuArtistCollectionIdList(backend_canister_id)
            .then((d) => {
                if (d) return d;
                return queryArtistCollectionIdListByBackend(backend_canister_id);
            })
            .then(resolve)
            .catch(reject);
    });

export const combinedQueryArtistCollectionDataList = async (
    backend_canister_id: string,
): Promise<ArtistCollectionData[]> =>
    new Promise((resolve, reject) => {
        canisterQueryYukuArtistCollectionDataList(backend_canister_id)
            .then((d) => {
                if (d) return d;
                return queryArtistCollectionDataListByBackend(backend_canister_id);
            })
            .then(resolve)
            .catch(reject);
    });
