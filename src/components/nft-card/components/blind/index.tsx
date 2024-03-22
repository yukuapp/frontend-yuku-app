import { useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { Modal } from 'antd';
import message from '@/components/message';
import { useOpenBlindBoxNft } from '@/hooks/nft/blind';
import { queryBlindBoxOpenTime } from '@/utils/canisters/nft/ext';
import {
    getCollectionNameByNftMetadata,
    getNameByNftMetadata,
    getThumbnailByNftMetadata,
} from '@/utils/nft/metadata';
import { collectionTokenMetadataStored } from '@/utils/stores/collection.stored';
import { cdn } from '@/common/cdn';
import { ConnectedIdentity } from '@/types/identity';
import { NftMetadata } from '@/types/nft';
import BlindBoxCountdownRenderer from '../../../countdown/blind-box';
import './index.less';

function BlindBoxModal({
    identity,
    card,
    refreshList,
    onClose,
}: {
    identity: ConnectedIdentity;
    card: NftMetadata;
    refreshList?: () => void;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(true);

    const { open: openBlindBox } = useOpenBlindBoxNft();

    const [opened, setOpened] = useState<NftMetadata | undefined>(undefined);

    const onModalClose = () => {
        setOpen(false);
        if (opened !== undefined) refreshList && refreshList();
        onClose();
    };

    const [openTime, setOpenTime] = useState<number | undefined>(undefined);
    useEffect(() => {
        queryBlindBoxOpenTime(card.owner.token_id.collection)
            .then((d) => setOpenTime(Number(d) / 1e6))
            .catch((e) => message.error(`query blindBoxOpenTime error ${e}`));
    }, [card]);

    useEffect(() => {
        openTime &&
            Math.round(openTime) - Date.now() <= 0 &&
            openBlindBox(identity, card.owner.token_id).then((metadata) => {
                if (metadata) {
                    collectionTokenMetadataStored.removeItem(card.metadata.token_id.collection);

                    setOpened({ ...card, metadata });
                    message.success('Open blind box successful.');
                }
            });
    }, [card, openTime]);
    return (
        <Modal open={open} onCancel={onModalClose} centered={true} width={600} footer={null}>
            {openTime && Math.round(openTime) - Date.now() > 0 && (
                <>
                    <div className="mt-[20px] flex w-full items-center md:mt-[0]">
                        <span className=" w-[90px] truncate text-[#7355FF] md:w-[150px]">
                            {getCollectionNameByNftMetadata(opened ?? card)}
                        </span>
                        {openTime && Math.round(openTime) - Date.now() > 0 && (
                            <>
                                <div className="ml-[6px] mr-[6px] font-inter-semibold text-[14px]">
                                    can be opened after
                                </div>
                                <Countdown
                                    date={Math.round(openTime)}
                                    renderer={BlindBoxCountdownRenderer}
                                />
                            </>
                        )}
                    </div>
                </>
            )}
            {opened && (
                <div className="font-inter-bold text-[20px] text-black">
                    You have opened
                    <span className="w-[150px] truncate text-[#7355FF]">
                        {getCollectionNameByNftMetadata(opened ?? card)}
                    </span>
                    and get:{' '}
                </div>
            )}
            <img
                className="m-auto mb-[14px] mt-[20px] h-[200px] w-[200px]"
                src={opened ? cdn(getThumbnailByNftMetadata(opened)) : ''}
            />

            {!opened && (
                <div className="mt-[15px] text-center font-inter-semibold text-[16px] text-black">
                    {openTime && Math.round(openTime) - Date.now() > 0
                        ? "Sorry,you can't open it now"
                        : 'Opening...'}
                </div>
            )}
            {opened && (
                <div className="mt-[15px] text-center font-inter-bold text-[16px] text-black">
                    {getNameByNftMetadata(opened ?? card)}
                </div>
            )}
        </Modal>
    );
}

export default BlindBoxModal;
