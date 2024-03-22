import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShowBuyButton } from '@/hooks/nft/functions/buy';
import { preventLink } from '@/common/react/link';
import { useIdentityStore } from '@/stores/identity';
import { BuyingAction, BuyNftExecutor } from '@/types/exchange/single-buy';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import BuyModal from '../components/buy';

function BuyButton({
    card,
    listing,
    buy,
    action,
    refreshListing,
    className,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    buy: BuyNftExecutor;
    action: BuyingAction;
    refreshListing: () => void;
    className?: string;
}) {
    const navigate = useNavigate();
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const showBuyButton = useShowBuyButton(card, listing);

    const [buyNft, setBuyNft] = useState<
        { card: NftMetadata; listing: NftListingData } | undefined
    >(undefined);
    const onCleanBuyNft = () => setBuyNft(undefined);

    const onBuy = () => {
        if (!identity) return navigate('/connect');
        setBuyNft({
            card,
            listing: listing!,
        });
    };

    if (!showBuyButton || !listing) return <></>;

    return (
        <>
            <button className={className} onClick={preventLink(onBuy)}>
                Buy now
            </button>
            {buyNft && (
                <BuyModal
                    card={buyNft.card}
                    listing={buyNft.listing}
                    buy={buy}
                    action={action}
                    refreshListing={refreshListing}
                    onClose={onCleanBuyNft}
                />
            )}
        </>
    );
}

export default BuyButton;
