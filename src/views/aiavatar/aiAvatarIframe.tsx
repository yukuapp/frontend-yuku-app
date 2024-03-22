import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import { YukuButton } from '@/components/ui/button';
import { getYukuAIAvatarHost } from '@/utils/apis/yuku/special';
import { getBuildMode } from '@/utils/app/env';
import { useIdentityStore } from '@/stores/identity';
import './index.less';

function AIAvatarHome() {
    const params = useParams();
    const avatarId = params.avatarId;
    const navigate = useNavigate();

    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const tokenRef = useRef(token);
    const [notConnected, setNotConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const aiAvatarHost = getYukuAIAvatarHost();

    const mode = getBuildMode();

    useEffect(() => {
        setLoading(true);
    }, []);

    useEffect(() => {
        if (token) {
            tokenRef.current = token;
        }
    }, [token]);

    useEffect(() => {
        if (!tokenRef.current) {
            setTimeout(() => {
                if (!tokenRef.current) {
                    setNotConnected(true);
                    setLoading(false);
                    message.error('Please login first!');
                }
            }, 8000);
        }
    }, [tokenRef]);

    const cancelModal = () => {
        navigate('/AIAvatar/home');
    };

    const iframeLoad = () => {
        setLoading(false);

        if (iframeRef.current?.contentWindow) {
            // iframeRef.current.contentWindow.postMessage(
            //     JSON.stringify({
            //         eventName: '',
            //         token: '',
            //     }),
            //     '*',
            // );
        }
    };

    return (
        <div className="fixed left-0 top-0 z-[101] h-screen w-screen bg-[#343434]">
            <div className="relative mx-auto flex h-full w-full flex-col items-center justify-center overflow-hidden">
                <div
                    onClick={cancelModal}
                    className="fixed left-[32px] top-[4.2vw] z-10 flex h-[53px] w-[68px] cursor-pointer items-center justify-center rounded-xl border bg-[#333a50] duration-300"
                >
                    <img src="/img/aiavatar/left-icon.svg" alt="" />
                </div>
                <div className="h-full w-full overflow-hidden">
                    {/* <div className="fixed h-[75px] w-full flex-col justify-center bg-[#22283A] px-[40px]">
                        <div className="text-[20px] font-semibold leading-[20px] text-white">
                            {avatarName}
                        </div>
                        <div className="mt-[12px] text-[14px] font-medium leading-[14px] text-white text-opacity-60">
                            Created By @Yuku
                        </div>
                    </div> */}
                    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#343434] text-white">
                        {loading && (
                            <div className="absolute left-[50%] top-[50%] flex h-screen w-full translate-x-[-50%] translate-y-[-50%] items-center justify-between">
                                <LoadingOutlined className="m-auto text-[50px]"></LoadingOutlined>
                            </div>
                        )}
                        {token && avatarId ? (
                            <iframe
                                title="space"
                                className="h-full w-full"
                                ref={iframeRef}
                                onLoad={iframeLoad}
                                src={`${aiAvatarHost}?userToken=${token?.user_id}&avatarId=${avatarId}${
                                    mode !== 'production' ? '&test=1' : ''
                                }`}
                                allow="microphone;camera;midi;encrypted-media;display-capture;"
                                allowFullScreen={true}
                                key={`${token?.user_id}`}
                            ></iframe>
                        ) : (
                            <div className="flex h-screen w-full items-center justify-between">
                                {notConnected && !loading ? (
                                    <YukuButton
                                        type={'CONFIRM'}
                                        onClick={() => {
                                            navigate('/connect');
                                        }}
                                        className="mx-auto"
                                    >
                                        Connect
                                    </YukuButton>
                                ) : (
                                    <LoadingOutlined className="m-auto text-[50px]"></LoadingOutlined>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AIAvatarHome;
