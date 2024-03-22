import { getNftPathByNftMetadata } from '@/utils/nft/metadata';
import { NftMetadata } from '@/types/nft';
import { useArtistCollectionIdList } from './collection';

export const useNftPath = (card: NftMetadata): string => {
    const artistCollectionIdList = useArtistCollectionIdList();
    const path = artistCollectionIdList
        ? getNftPathByNftMetadata(card, artistCollectionIdList)
        : '';
    return path;
};
