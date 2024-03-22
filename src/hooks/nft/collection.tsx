import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
    getYukuArtistRouterCanisterId,
    getYukuCoreCanisterId,
} from '@/utils/canisters/yuku-old/special';
import { useCollectionStore } from '@/stores/collection';
import { ArtistCollectionData, CoreCollectionData, UniqueCollectionData } from '@/types/yuku';

export const useCoreCollectionIdList = (): string[] | undefined => {
    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
    const storedCoreCollectionIdList = useCollectionStore((s) => s.storedCoreCollectionIdList);

    const [list, setList] = useState<string[] | undefined>(undefined);
    useEffect(() => {
        setList(storedCoreCollectionIdList[backend_canister_id_yuku_core]);
    }, [storedCoreCollectionIdList]);

    return list;
};

export const useArtistCollectionIdList = (): string[] | undefined => {
    const backend_canister_id_yuku_artist_router = getYukuArtistRouterCanisterId();
    const storedArtistCollectionIdList = useCollectionStore((s) => s.storedArtistCollectionIdList);

    const [list, setList] = useState<string[] | undefined>(undefined);
    useEffect(() => {
        setList(storedArtistCollectionIdList[backend_canister_id_yuku_artist_router]);
    }, [storedArtistCollectionIdList]);

    return list;
};

export const useCoreCollectionDataList = (): CoreCollectionData[] | undefined => {
    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
    const storedCoreCollectionDataList = useCollectionStore((s) => s.storedCoreCollectionDataList);

    const [list, setList] = useState<CoreCollectionData[] | undefined>(undefined);
    useEffect(() => {
        setList(storedCoreCollectionDataList[backend_canister_id_yuku_core]);
    }, [storedCoreCollectionDataList]);

    return list;
};

export const useArtistCollectionDataList = (): ArtistCollectionData[] | undefined => {
    const backend_canister_id_yuku_artist_router = getYukuArtistRouterCanisterId();
    const storedArtistCollectionDataList = useCollectionStore(
        (s) => s.storedArtistCollectionDataList,
    );

    const [list, setList] = useState<CoreCollectionData[] | undefined>(undefined);
    useEffect(() => {
        setList(storedArtistCollectionDataList[backend_canister_id_yuku_artist_router]);
    }, [storedArtistCollectionDataList]);

    return list;
};

export const useCollectionDataList = (): UniqueCollectionData[] => {
    const coreCollectionDataList = useCoreCollectionDataList();
    const artistCollectionDataList = useArtistCollectionDataList();

    const [list, setList] = useState<UniqueCollectionData[]>([]);
    useEffect(() => {
        let collectionDataList: UniqueCollectionData[] = [
            ...(coreCollectionDataList ?? []),
            ...(artistCollectionDataList ?? []),
        ];
        collectionDataList = _.uniqBy(collectionDataList, (item) => item.info.collection);
        setList(collectionDataList);
    }, [coreCollectionDataList, artistCollectionDataList]);

    return list;
};
