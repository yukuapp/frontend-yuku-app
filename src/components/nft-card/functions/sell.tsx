import { useEffect, useState } from 'react';
import { useShowChangePriceButton, useShowSellButton } from '@/hooks/nft/functions/sell';
import { preventLink } from '@/common/react/link';
import { useTransactionStore } from '@/stores/transaction';
import { HoldingAction } from '@/types/exchange/single-hold';
import { SellNftExecutor } from '@/types/exchange/single-sell';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import SellModal from '../components/sell';

function SellButton({
    card,
    listing,
    holdingAction,
    lastPrice,
    identity,
    sell,
    executing,
    refreshListing,
    className,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    holdingAction: HoldingAction;
    lastPrice?: string;
    identity?: ConnectedIdentity;
    sell: SellNftExecutor;
    executing: boolean;
    refreshListing: () => void;
    className?: string;
}) {
    const showSellButton =
        lastPrice === undefined
            ? useShowSellButton(card, listing)
            : useShowChangePriceButton(card, listing, holdingAction);

    const [sellNft, setSellNft] = useState<NftMetadata | undefined>(undefined);
    const onCleanSellNft = () => setSellNft(undefined);

    const onSell = () => setSellNft(card);

    const refreshSingleSellFlags = useTransactionStore((s) => s.refreshFlags['single-sell']);
    useEffect(() => {
        refreshSingleSellFlags && refreshListing();
    }, [refreshSingleSellFlags]);
    if (!showSellButton || !identity) return <></>;
    return (
        <>
            <button className={className} onClick={preventLink(onSell)}>
                {lastPrice ? <span>Change price</span> : <span>Sell</span>}
            </button>
            {sellNft && (
                <>
                    <SellModal
                        identity={identity}
                        card={sellNft}
                        lastPrice={lastPrice}
                        sell={sell}
                        executing={executing}
                        refreshListing={refreshListing}
                        onClose={onCleanSellNft}
                    />
                </>
            )}
        </>
    );
}

export default SellButton;
