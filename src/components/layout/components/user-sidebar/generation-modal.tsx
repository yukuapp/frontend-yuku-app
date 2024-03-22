import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { isMobile } from 'react-device-detect';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import YukuModal from '@/components/modal/yuku-modal';
import CloseIcon from '@/components/ui/close-icon';
import { Label } from '@/components/ui/label';
import { useCheckTokenEmail } from '@/hooks/common/token';
import { generateIcWallet } from '@/utils/apis/yuku/api';
import { cn } from '@/common/cn';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';

export default function GenerationModal() {
    const identity = useIdentityStore((s) => s.connectedIdentity);

    const hasIcWallet = identity?.connectType === 'email' && identity.principal;
    const generationOpen = useAppStore((s) => s.generationOpen);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = identity && getYukuToken();
    const [generating, setGenerating] = useState<boolean>();
    const setGenerationOpen = useAppStore((s) => s.setGenerationOpen);
    const onClose = () => {
        setGenerationOpen(false);
    };
    const { is_email, check_token } = useCheckTokenEmail();
    return (
        <YukuModal
            open={generationOpen}
            onClose={onClose}
            width={cn('w-[550px]', isMobile && 'w-full')}
            hasHeader={false}
        >
            <div className="flex flex-col gap-y-4">
                <div className="flex items-center justify-start">
                    <img src="/img/login/generate-done.svg" alt="" />
                    <div
                        className={cn(
                            'ml-[27px] font-inter-medium  text-xl',
                            isMobile && 'ml-[10px]',
                        )}
                    >
                        Network
                    </div>
                    <CloseIcon onClick={onClose} className="ml-auto"></CloseIcon>
                </div>
                <div className="flex">
                    <div className="ml-[13px] h-20 w-[2px] bg-shiku"></div>
                    <Label
                        className={cn(
                            'ml-[30px] flex h-[60px] w-[490px] items-center rounded-[8px] bg-[#283047] px-4',
                            isMobile && 'ml-[7px] w-full',
                        )}
                    >
                        <div className=" font-inter-semibold text-base">ICP</div>
                        <div className="ml-[10px] text-base text-white/60">
                            Internet Computer (ICP)
                        </div>
                    </Label>
                </div>
                <div className="flex items-center justify-start">
                    <img src="/img/login/generate-done.svg" alt="" />
                    <div
                        className={cn(
                            'ml-[27px] font-inter-medium  text-xl',
                            isMobile && 'ml-[10px]',
                        )}
                    >
                        Generate Address
                    </div>
                </div>
                <div
                    className={cn(
                        'ml-[46px] flex h-[229px] w-[490px] items-start justify-start rounded-[8px] bg-[#283047] px-[15px] py-[32px]',
                        isMobile && 'max-w-[80% ml-[10px] h-[180px] w-fit',
                    )}
                >
                    {!hasIcWallet ? (
                        <div
                            className="flex h-full w-full cursor-pointer items-center justify-center text-center font-inter-semibold text-base underline"
                            onClick={() => {
                                if (generating || !token) {
                                    return;
                                }
                                setGenerating(true);
                                generateIcWallet({
                                    user_id: token?.user_id,
                                    user_token: token?.user_token,
                                })
                                    .then(() => {
                                        is_email && check_token && check_token();
                                    })
                                    .catch((e) => {
                                        console.debug('🚀 ~ Wallet ~ e:', e);
                                    })
                                    .finally(() => {
                                        setGenerating(false);
                                    });
                            }}
                        >
                            <div className="h-fit w-fit">
                                Click to generate the address{' '}
                                {generating && (
                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className={cn(
                                    'flex flex-col font-inter-semibold text-base text-white/50',
                                    isMobile && 'text-sm',
                                )}
                            >
                                Internet Computer(ICP) Address
                                <div className="mt-[39px] flex items-center justify-between text-white">
                                    <div
                                        className={cn(
                                            'w-[327px] font-inter-medium text-[22px] leading-normal',
                                            isMobile && 'w-[90%] text-sm',
                                        )}
                                    >
                                        {identity.principal}
                                    </div>
                                    <CopyToClipboard
                                        text={identity?.principal}
                                        onCopy={() => {
                                            message.success('Copied');
                                        }}
                                    >
                                        <img
                                            src="/img/login/copy.svg"
                                            alt=""
                                            className="ml-[75px] cursor-pointer text-white"
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </YukuModal>
    );
}
