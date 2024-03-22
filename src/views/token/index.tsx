import CopyToClipboard from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom';
import message from '@/components/message';
import { YukuButton } from '@/components/ui/button';
import { useIdentityStore } from '@/stores/identity';

export default function Token() {
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const navigate = useNavigate();
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            {' '}
            <p className="mb-[30px] text-[18px] text-white">Retrieve your user access token</p>
            <CopyToClipboard
                text={`${token?.user_id}|${token?.user_token}`}
                onCopy={() => {
                    token ? message.success('Copied to clipboard') : navigate('/connect');
                }}
            >
                <div className="mx-auto">
                    <YukuButton className="w-max" type={'CONFIRM'} onClick={() => {}}>
                        {token ? 'Copy' : 'Please Login'}
                    </YukuButton>
                </div>
            </CopyToClipboard>
        </div>
    );
}
