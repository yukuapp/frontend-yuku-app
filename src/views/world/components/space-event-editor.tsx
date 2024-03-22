import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import { getYukuSpaceHost } from '@/utils/apis/yuku/special';
import { useIdentityStore } from '@/stores/identity';
import { YukuButton } from '../../../components/ui/button';

const SpaceEditor = () => {
    const param = useParams();
    const navigate = useNavigate();
    const space_event_id = param.id;
    const owner = param.owner;
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const user_token = `${token?.user_id}|${token?.user_token}`;
    const tokenRef = useRef(token);
    const [notConnected, setNotConnected] = useState<boolean>(false);
    const spaceHost = getYukuSpaceHost();

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
    return (
        <div className="absolute z-[999] h-full w-full bg-[#101522]">
            {token ? (
                <iframe
                    title="space event"
                    className="h-full w-full"
                    ref={iframeRef}
                    onLoad={() => {
                        if (iframeRef.current?.contentWindow) {
                            iframeRef.current.contentWindow.postMessage(
                                JSON.stringify({
                                    eventName: 'webLogin',
                                    token: user_token,
                                }),
                                '*',
                            );
                        }
                    }}
                    src={`${spaceHost}?eventId=${space_event_id}${
                        owner ? '&ownerId=' + owner : ''
                    }`}
                    allow="microphone;camera;midi;encrypted-media;display-capture;"
                    allowFullScreen={true}
                    key={`${space_event_id}${token?.user_id}`}
                ></iframe>
            ) : (
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

export default SpaceEditor;
