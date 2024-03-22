import { useState } from 'react';
import { Modal } from 'antd';
import message from '@/components/message';
import { useShowHoldButton } from '@/hooks/nft/functions/hold';
import { alreadyMessaged } from '@/common/data/promise';
import { preventLink } from '@/common/react/link';
import { HoldingAction, HoldingNftExecutor } from '@/types/exchange/single-hold';
import { ConnectedIdentity } from '@/types/identity';
import { NftListingData } from '@/types/listing';
import { NftMetadata } from '@/types/nft';
import Loading from '../../ui/loading';

const CancelModal = () => {
    const [open, setOpen] = useState(true);
    const onModalClose = () => setOpen(false);
    return (
        <Modal open={open} centered={true} footer={null} onCancel={onModalClose}>
            <div className="flex h-[400px] flex-col">
                <div className='text-black" mb-[20px] font-inter-bold text-[20px]'>
                    {'Cancelling your listing'}
                </div>
                <div className="flex flex-1">
                    <Loading className="my-auto" />
                </div>
            </div>
        </Modal>
    );
};

function HoldButton({
    card,
    listing,
    identity,
    hold,
    action,
    refreshListing,
    className,
}: {
    card: NftMetadata;
    listing: NftListingData | undefined;
    identity?: ConnectedIdentity;
    hold: HoldingNftExecutor;
    action: HoldingAction;
    refreshListing: () => void;
    className?: string;
}) {
    const showHoldButton = useShowHoldButton(card, listing);

    const onHolding = async () => {
        if (action !== undefined) return;
        message.loading('Cancelling your listing', 1000);
        hold(identity!, card.owner)
            .then((d) => {
                message.destroy();
                return alreadyMessaged(d);
            })
            .then(() => {
                message.success('Cancel listing successful.');
                refreshListing();
            });
    };

    if (!showHoldButton || !identity) return <></>;
    return (
        <>
            <button className={className} onClick={preventLink(onHolding)}>
                Cancel
            </button>
            {action && action !== 'HOLDING' && <CancelModal />}
        </>
    );
}

export default HoldButton;
