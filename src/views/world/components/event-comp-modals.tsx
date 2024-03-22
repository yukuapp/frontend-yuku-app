import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import YukuModal from '@/components/modal/yuku-modal';
import { YukuButton } from '@/components/ui/button';
import { deleteSpaceEvent } from '@/utils/apis/yuku/api';
import { cn } from '@/common/cn';
import { useIdentityStore } from '@/stores/identity';

export const DeleteEventModal = ({
    open,
    onClose,
    event,
    updateEventList,
}: {
    open: boolean;
    onClose: () => void;
    event: any;
    updateEventList: (s?: boolean) => void;
}) => {
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const [deleting, setDeleting] = useState<boolean>(false);
    return (
        <YukuModal hasHeader={false} open={open} onClose={onClose}>
            <div className="flex flex-col items-center justify-center">
                <img src="/img/world/delete-warning.svg" className="w-[126px]" alt="" />
                <div className="mt-[35px] text-center font-inter-semibold text-lg leading-loose text-[#E5F0FF]">
                    Do you want to delete this event?
                </div>
                <div className="mt-[35px] flex justify-between gap-x-[89px]">
                    <YukuButton type={'CANCEL'} onClick={onClose}>
                        Cancel
                    </YukuButton>
                    <YukuButton
                        type={'CONFIRM'}
                        onClick={() => {
                            if (token) {
                                setDeleting(true);
                                !deleting &&
                                    deleteSpaceEvent({
                                        params: token,
                                        data: { id: event.id },
                                    }).finally(() => {
                                        setDeleting(false);
                                        updateEventList(true);
                                        onClose();
                                    });
                            }
                        }}
                    >
                        Delete
                        {deleting && <LoadingOutlined className="ml-2"></LoadingOutlined>}
                    </YukuButton>
                </div>
            </div>
        </YukuModal>
    );
};

export const ShareEventModal = ({
    open,
    onClose,
    url,
}: {
    open: boolean;
    onClose: () => void;
    url: string;
}) => {
    return (
        <YukuModal
            title="Share Event"
            open={open}
            width={cn(isMobile && 'w-full')}
            onClose={onClose}
        >
            <div className="flex flex-col items-start justify-center">
                <div className="mt-[55px] text-center font-inter-semibold text-base leading-loose text-[#E5F0FF]">
                    URL Link
                </div>
                <div
                    className={cn(
                        'mt-5 h-[60px] w-[490px] rounded-[8px] bg-[#283047]   px-5 font-inter-medium text-sm leading-[60px] text-[#fff]',
                        isMobile && 'w-full px-[4px]',
                    )}
                >
                    {url}
                </div>
                <CopyToClipboard text={url} onCopy={() => message.success(`Copied`)}>
                    <YukuButton type={'CONFIRM'} className="mx-auto mt-[57px]" onClick={onClose}>
                        Copy
                    </YukuButton>
                </CopyToClipboard>
            </div>
        </YukuModal>
    );
};
