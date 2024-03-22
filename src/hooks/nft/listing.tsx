import { useCallback, useEffect, useState } from 'react';
import { queryFloorPrice } from '@/utils/canisters/entrepot';
import { queryNftListingData } from '@/utils/nft/listing';
import { putMemoryNftListing, removeMemoryNftListing } from '@/utils/stores/listing.stored';
import { NFT_EXT_WITHOUT_APPROVE } from '@/canisters/nft/special';
import { isSame } from '@/common/data/same';
import { isSameNftByTokenId, uniqueKey } from '@/common/nft/identifier';
import { FirstRenderByData } from '@/common/react/render';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata, NftTokenOwner } from '@/types/nft';

export const useNftListing = (
    card: NftMetadata | undefined,
    updateItem?: (card: NftMetadata) => void,
): {
    loading: boolean;
    listing: NftListingData | undefined;
    reload: () => void;
    refresh: () => void;
} => {
    const [loading, setLoading] = useState<boolean>(false);
    const [listing, setListing] = useState<NftListingData | undefined>(card?.listing);
    useEffect(() => {
        if (card === undefined) return setListing(undefined);
        if (card.listing !== undefined && !isSame(listing, card.listing)) setListing(card.listing);
    }, [card, listing]);

    const setListingAndUpdate = (listing: NftListingData, old: NftListingData | undefined) => {
        if (card === undefined) return;

        if (listing) putMemoryNftListing(card.owner.token_id, listing);
        else removeMemoryNftListing(card.owner.token_id);

        if (isSame(card.listing, listing) && isSame(old, listing)) return;

        setListing(listing);
        card.listing = listing;
        updateItem && updateItem(card);
    };

    const reload = useCallback(async () => {
        if (card === undefined) {
            return;
        }

        setListing(undefined);
        setLoading(true);
        queryNftListingData(card.metadata.token_id)
            .then((data) => setListingAndUpdate(data, listing))
            .catch((e) => console.error(`reload nft listing failed`, e))
            .finally(() => setLoading(false));
    }, [card]);

    const refresh = useCallback(() => {
        if (card === undefined) {
            return;
        }
        queryNftListingData(card.metadata.token_id).then((data) =>
            setListingAndUpdate(data, listing),
        );
    }, [card]);

    const [once_load_listing] = useState(new FirstRenderByData());
    useEffect(() => {
        if (card?.listing) return;
        once_load_listing.once(card && [uniqueKey(card.owner.token_id)], reload);
    }, [card]);

    const batchSales = useIdentityStore((s) => s.batchSales);
    const [once_load_listing_by_batch_sales] = useState(new FirstRenderByData());
    useEffect(() => {
        once_load_listing_by_batch_sales.once(
            card && [!!batchSales.find((l) => isSameNftByTokenId(l, card.metadata))],
            refresh,
        );
    }, [batchSales]);

    return {
        loading,
        listing: listing ?? card?.listing,
        reload,
        refresh,
    };
};

export const refreshNftListing = (owner: NftTokenOwner | undefined) => {
    if (!owner) return;
    queryNftListingData(owner.token_id).then((listing) => {
        if (listing) putMemoryNftListing(owner.token_id, listing);
        else removeMemoryNftListing(owner.token_id);
    });
};
// entrepot floor
export const useEntrepotFloor = (collection?: string) => {
    const [entrepotFloor, setEntrepotFloor] = useState<string>();
    useEffect(() => {
        if (collection && NFT_EXT_WITHOUT_APPROVE.includes(collection)) {
            queryFloorPrice(collection)
                .then(setEntrepotFloor)
                .catch(() => {
                    setEntrepotFloor(undefined);
                });
        }
    }, [collection]);
    return entrepotFloor;
};
