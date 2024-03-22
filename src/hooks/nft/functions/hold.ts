import { useEffect, useState } from 'react';
import { useIdentityStore } from '@/stores/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';

export const useShowHoldButton = (
    card: NftMetadata | undefined,
    listing: NftListingData | undefined,
): boolean => {
    const [show, setShow] = useState(false);

    // self
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const self = !!identity && !!card && card.owner.owner === identity.account;

    useEffect(() => {
        setShow(() => {
            if (card === undefined) return false;
            if (identity === undefined) return false;
            if (!self) return false;
            if (listing === undefined) return false;
            return listing?.listing.type !== 'holding';
        });
    }, [card, identity, self, listing]);

    return show;
};
