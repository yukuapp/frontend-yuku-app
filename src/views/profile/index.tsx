import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import message from '@/components/message';
import { isAccountHex, principal2account } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { FirstRenderByData } from '@/common/react/render';
import { useIdentityStore } from '@/stores/identity';
import { isValidProfileTab, ProfileTab } from './common';
import './index.less';
import Profile from './profile';

function ProfileContainer() {
    const navigate = useNavigate();

    const param = useParams();
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const principal_or_account = param.principal_or_account
        ? param.principal_or_account
        : connectedIdentity?.principal;
    const tab: ProfileTab = param.tab ? (param.tab as ProfileTab) : 'collected';

    const [once_check_params] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_check_params.once([principal_or_account, tab], () => {
                if (!principal_or_account) return navigate('/connect');
                if (!isPrincipalText(principal_or_account) && !isAccountHex(principal_or_account)) {
                    message.error('wrong principal id');
                    return navigate('/', { replace: true });
                }
                if (!isValidProfileTab(tab)) return navigate('/', { replace: true });
            }),
        [principal_or_account, tab],
    );

    const { principal, account }: { principal?: string; account?: string } = useMemo(() => {
        if (!principal_or_account) return {};
        if (isPrincipalText(principal_or_account)) {
            return {
                principal: principal_or_account,
                account: principal2account(principal_or_account),
            };
        }
        if (isAccountHex(principal_or_account)) {
            return {
                account: principal_or_account,
            };
        }
        return {};
    }, [principal_or_account]);

    if (!account) return <div></div>;
    if (!isValidProfileTab(tab)) return <div></div>;

    return (
        <div className="profile-container min-h-[100vh]">
            <Profile principal={principal} account={account} tab={tab} />
        </div>
    );
}

export default ProfileContainer;
