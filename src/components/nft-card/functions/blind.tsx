import { useState } from 'react';
import { useShowBlindBoxButton } from '@/hooks/nft/functions/blind';
import { preventLink } from '@/common/react/link';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import BlindBoxModal from '../components/blind';

function BlindBoxButton({
    card,
    listing,
    identity,
    refreshList,
    className,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    identity?: ConnectedIdentity;
    refreshList: () => void;
    className?: string;
}) {
    const showOpenBlindButton = useShowBlindBoxButton(card, listing);

    const [openingNft, setOpeningNft] = useState<NftMetadata | undefined>(undefined);
    const onCleanTransferNft = () => setOpeningNft(undefined);

    const onOpen = () => setOpeningNft(card);

    if (!showOpenBlindButton || !identity) return <></>;
    return (
        <>
            <button className={className} onClick={preventLink(onOpen)}>
                Open
            </button>
            {openingNft && (
                <BlindBoxModal
                    identity={identity}
                    card={openingNft}
                    refreshList={refreshList}
                    onClose={onCleanTransferNft}
                />
            )}
        </>
    );
}

export default BlindBoxButton;
