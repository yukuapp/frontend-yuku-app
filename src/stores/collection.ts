import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { isDevMode } from '@/utils/app/env';
import { queryCoreCollectionDataListByBackend } from '@/utils/canisters/yuku-old/core';
import {
    getYukuArtistRouterCanisterId,
    getYukuCoreCanisterId,
} from '@/utils/canisters/yuku-old/special';
import {
    combinedQueryArtistCollectionDataList,
    combinedQueryArtistCollectionIdList,
} from '@/utils/combined/yuku/artist_router';
import { combinedQueryCoreCollectionIdList } from '@/utils/combined/yuku/core';
import { ArtistCollectionData, CoreCollectionData } from '@/types/yuku';

const isDev = isDevMode();

interface CollectionState {
    storedCoreCollectionIdList: Record<string, string[]>;
    reloadCoreCollectionIdList: () => Promise<string[]>;
    storedArtistCollectionIdList: Record<string, string[]>;
    reloadArtistCollectionIdList: () => Promise<string[]>;

    storedCoreCollectionDataList: Record<string, CoreCollectionData[]>;
    reloadCoreCollectionDataList: () => Promise<CoreCollectionData[]>;
    storedArtistCollectionDataList: Record<string, ArtistCollectionData[]>;
    reloadArtistCollectionDataList: () => Promise<ArtistCollectionData[]>;
}

export const useCollectionStore = create<CollectionState>()(
    devtools(
        persist(
            (set, get) => ({
                storedCoreCollectionIdList: {},
                reloadCoreCollectionIdList: async (): Promise<string[]> => {
                    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
                    const list = await combinedQueryCoreCollectionIdList(
                        backend_canister_id_yuku_core,
                    );
                    set({
                        storedCoreCollectionIdList: {
                            ...get().storedCoreCollectionIdList,
                            [backend_canister_id_yuku_core]: list,
                        },
                    });
                    return list;
                },
                storedArtistCollectionIdList: {},
                reloadArtistCollectionIdList: async (): Promise<string[]> => {
                    const backend_canister_id_yuku_artist_router = getYukuArtistRouterCanisterId();
                    const list = await combinedQueryArtistCollectionIdList(
                        backend_canister_id_yuku_artist_router,
                    );
                    set({
                        storedArtistCollectionIdList: {
                            ...get().storedArtistCollectionIdList,
                            [backend_canister_id_yuku_artist_router]: list,
                        },
                    });
                    return list;
                },

                storedCoreCollectionDataList: {},
                reloadCoreCollectionDataList: async (): Promise<CoreCollectionData[]> => {
                    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
                    const list = await queryCoreCollectionDataListByBackend(
                        backend_canister_id_yuku_core,
                    );
                    console.debug(
                        '🚀 ~ reloadCoreCollectionDataList: ~ backend_canister_id_yuku_core:',
                        list,
                    );
                    set({
                        storedCoreCollectionDataList: {
                            ...get().storedCoreCollectionDataList,
                            [backend_canister_id_yuku_core]: list,
                        },
                    });
                    return list;
                },
                storedArtistCollectionDataList: {},
                reloadArtistCollectionDataList: async (): Promise<ArtistCollectionData[]> => {
                    const backend_canister_id_yuku_artist_router = getYukuArtistRouterCanisterId();
                    const list = await combinedQueryArtistCollectionDataList(
                        backend_canister_id_yuku_artist_router,
                    );
                    set({
                        storedArtistCollectionDataList: {
                            ...get().storedArtistCollectionDataList,
                            [backend_canister_id_yuku_artist_router]: list,
                        },
                    });
                    return list;
                },
            }),
            {
                name: '__yuku_collection__',
            },
        ),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('CollectionStore', useCollectionStore);
