import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { getNftCardsByStoredRemote } from '@/utils/nft/metadata';
import { isSameNft } from '@/common/nft/identifier';
import { NftIdentifier, NftMetadata } from '@/types/nft';
import { CoreCollectionData } from '@/types/yuku';

export const useNftCard = (
    data: CoreCollectionData | undefined,
    token_id: NftIdentifier | undefined,
    delay?: number,
): {
    card: NftMetadata | undefined;
    refresh: () => void;
} => {
    const collection = token_id?.collection;
    const token_identifier = token_id?.token_identifier;

    const [card, setCard] = useState<NftMetadata | undefined>(undefined);

    const refresh = useCallback(() => {
        if (collection === undefined || data === undefined || token_identifier === undefined)
            return;

        const token_id: NftIdentifier = { collection, token_identifier };
        getNftCardsByStoredRemote(data ? [data] : [], [token_id])
            .then((list) => {
                const card = list.find((c) => isSameNft(c.owner.token_id, token_id));
                if (card) setCard(card);
            })
            .catch((e) => {
                console.error(`market nft getNftListByStoredRemote`, e);
            });
    }, [data, collection, token_identifier]);

    useEffect(refresh, [data, collection, token_identifier]);

    if (delay !== undefined) useInterval(refresh, delay);

    return {
        card,
        refresh,
    };
};
