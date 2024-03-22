import YukuModal from '@/components/modal/yuku-modal';
import { YukuButton } from '@/components/ui/button';

const UseAvatarModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    return (
        <YukuModal hasHeader={true} open={open} onClose={onClose} width={'w-[100%] md:w-[520px]'}>
            <div className="flex flex-col items-center justify-center">
                <img src="/img/world/success.svg" className="w-[140px]" alt="" />
                <div className="mt-[35px] text-center font-inter-semibold text-lg leading-tight text-[#fff]">
                    Avatar Applied.
                </div>
                <div className="mt-[20px] text-center font-inter-semibold text-sm leading-tight text-[#fff] opacity-70">
                    Now you can use this AVATAR in any SPACES.
                </div>
                <div className="mt-[35px] flex justify-between gap-x-[89px]">
                    <YukuButton type={'CONFIRM'} onClick={onClose}>
                        OK
                    </YukuButton>
                </div>
            </div>
        </YukuModal>
    );
};

export default UseAvatarModal;
