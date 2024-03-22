import { Modal } from 'antd';
import CloseIcon from '@/components/ui/close-icon';
import { cn } from '@/common/cn';
import './index.less';

export default function YukuModal({
    open,
    title,
    hasHeader = true,
    onClose,
    children,
    width = 'w-[550px]',
    maskClosable = true,
    keyboard = false,
}: {
    width?: string;
    title?: string;
    hasHeader?: boolean;
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maskClosable?: boolean;
    keyboard?: boolean;
}) {
    return (
        <Modal
            open={open}
            closeIcon={null}
            footer={null}
            centered={true}
            onCancel={onClose}
            className="yuku-modal !w-fit"
            maskClosable={maskClosable}
            keyboard={keyboard}
        >
            <div className={cn('flex flex-col', width)}>
                {hasHeader && (
                    <div className="flex w-full justify-between">
                        <div className="w-fit font-inter-bold text-[20px]">{title}</div>
                        <CloseIcon onClick={onClose} />
                    </div>
                )}
                {children}
            </div>
        </Modal>
    );
}
