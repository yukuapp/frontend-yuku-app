import { useEffect, useState } from 'react';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useShowCartButton = (
    card: NftMetadata | undefined,
    listing: NftListingData | undefined,
): boolean => {
    const [show, setShow] = useState(false);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    const shoppingCartItems = useIdentityStore((s) => s.shoppingCartItems);

    useEffect(() => {
        setShow(() => {
            if (card === undefined) return false;

            if (self) return false;
            if (listing === undefined) return false;
            if (listing?.listing.type !== 'listing') return false;
            if (card.owner.raw.standard === 'ogy') return false;
            if (identity && shoppingCartItems === undefined) return false;
            return true;
        });
    }, [card, self, listing, shoppingCartItems]);

    return show;
};
