import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { queryNftListingData, queryNftListingDataByList } from '@/utils/nft/listing';
import { putMemoryNftListing, removeMemoryNftListing } from '@/utils/stores/listing.stored';
import { isSame } from '@/common/data/same';
import { uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useNftListing = (
    card: NftMetadata | undefined,
    delay = 15000,
): {
    listing: NftListingData | undefined;
    refresh: () => void;
} => {
    const [listing, setListing] = useState<NftListingData | undefined>(card?.listing);

    const refresh = useCallback(() => {
        if (card === undefined) {
            return;
        }
        queryNftListingData(card.owner.token_id).then((listing) => {
            if (listing) putMemoryNftListing(card.owner.token_id, listing);
            else removeMemoryNftListing(card.owner.token_id);

            card.listing = listing;
            setListing(listing);
        });
    }, [card]);

    const [once_check_listings] = useState(new FirstRenderByData());
    useEffect(() => {
        once_check_listings.once(card && [card.owner.token_id], refresh);
    }, [card]);

    useInterval(refresh, delay);

    return {
        listing,
        refresh,
    };
};

export const useReloadAllListingData = (
    showed: boolean,
    doResort: () => void,
    listing: NftMetadata[] | undefined,
    loadings: boolean[],
) => {
    const reloadAllListingData = useCallback(
        (listing: NftMetadata[] | undefined) => {
            if (!showed) return;
            if (listing === undefined) return;
            const block_list = [...listing];
            queryNftListingDataByList(
                block_list.map((card) => ({
                    standard: card.owner.raw.standard,
                    token_id: card.owner.token_id,
                })),
            ).then((r) => {
                let changed: NftMetadata | undefined = undefined;
                for (const card of block_list) {
                    const key = uniqueKey(card.owner.token_id);
                    const listing = r[key];
                    if (listing) putMemoryNftListing(card.owner.token_id, listing);
                    if (!listing || isSame(card.listing, listing)) continue;
                    changed = card;
                    card.listing = listing;
                }
                if (changed) doResort();
            });
        },
        [showed, doResort],
    );
    const [once_load_all_listing] = useState(new FirstRenderByData());
    useEffect(() => {
        if (!showed) return;
        once_load_all_listing.once(loadings, () => reloadAllListingData(listing));
    }, loadings);

    useInterval(() => reloadAllListingData(listing), 15000);
};
