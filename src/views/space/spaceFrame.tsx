import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import { getYukuSpaceHost } from '@/utils/apis/yuku/special';
import { useIdentityStore } from '@/stores/identity';
import { YukuButton } from '../../components/ui/button';
import './index.less';

const SpaceFrame = () => {
    const { pathname } = window.location;
    const [isError, setIsError] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const type = searchParams.get('type');
    const map = searchParams.get('map');
    const scene_id = searchParams.get('scene_id');
    const sku = searchParams.get('sku');
    const iframe_id = 'scene';
    const spaceHost = getYukuSpaceHost();

    const [notConnected, setNotConnected] = useState<boolean>(false);
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const tokenRef = useRef(token);
    const user_token = `${token?.user_id}|${token?.user_token}`;

    useEffect(() => {
        tokenRef.current = token;
    }, [token]);
    useEffect(() => {
        if (!tokenRef.current) {
            setTimeout(() => {
                if (!tokenRef.current) {
                    setNotConnected(true);
                    message.error('Please login first!');
                }
            }, 8000);
        }
    }, [tokenRef]);

    const postMessage = () => {
        const frame_id: any = document.getElementById(iframe_id);

        frame_id &&
            frame_id.contentWindow.postMessage(
                JSON.stringify({
                    eventName: 'webLogin',
                    token: user_token,
                }),
                '*',
            );
    };

    const arr = [
        // '/spaces/origyn',
        // // "/spaces/shiku",
        // '/spaces/artgallery',
        // '/conference',
        // '/spaces/mcc',
        // '/spaces/dfinity',
        // '/spaces/lounge',
        // '/spaces/fest',
        // '/conference/seaside-party',
        // '/create/avatar',
        // '/create/scene',
        '/scene',
    ];
    useEffect(() => {
        if (arr.indexOf(pathname) === -1) {
            setIsError(true);
        }
    }, [pathname]);

    if (isError) {
        navigate('/');
        return;
    }

    return (
        <div className="venue-wrap !z-[101] !bg-[#101522]">
            {pathname === '/scene' && token && (
                <iframe
                    title="scene"
                    onLoad={() => postMessage()}
                    id={iframe_id}
                    src={`${spaceHost}?type=${type}&map=${map ?? 'SceneEditor'}${
                        sku ? '&sku=' + sku : ''
                    }`}
                    allow="microphone;camera;midi;encrypted-media;display-capture;"
                    allowFullScreen={true}
                    key={`${scene_id}${token?.user_id}`}
                ></iframe>
            )}
            {!token && (
                <div className="flex h-screen w-full items-center justify-between">
                    {notConnected ? (
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
    );
};

export default SpaceFrame;
