import { useState } from 'react';
import { useShowTransferButton } from '@/hooks/nft/functions/transfer';
import { preventLink } from '@/common/react/link';
import { TransferNftExecutor, TransferringAction } from '@/types/exchange/single-transfer';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import TransferModal from '../components/transfer';

function TransferButton({
    card,
    listing,
    identity,
    transfer,
    action,
    refreshList,
    className,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    identity?: ConnectedIdentity;
    transfer: TransferNftExecutor;
    action: TransferringAction;
    refreshList: () => void;
    className?: string;
}) {
    const showTransferButton = useShowTransferButton(card, listing);

    const [transferNft, setTransferNft] = useState<NftMetadata | undefined>(undefined);
    const onCleanTransferNft = () => setTransferNft(undefined);

    const onTransfer = () => setTransferNft(card);

    if (!showTransferButton || !identity) return <></>;
    return (
        <>
            <button className={className} onClick={preventLink(onTransfer)}>
                Transfer
            </button>
            {transferNft && (
                <TransferModal
                    identity={identity}
                    card={transferNft}
                    transfer={transfer}
                    action={action}
                    refreshList={refreshList}
                    onClose={onCleanTransferNft}
                />
            )}
        </>
    );
}

export default TransferButton;
