import { useEffect, useState } from 'react';
import { getUserProfile } from '@/utils/stores/profile.stored';
import { isPrincipalText } from '@/common/ic/principals';

export const useUserAvatar = (
    principal_or_account: string | undefined,
): { principal: string | undefined; avatar: string | undefined } => {
    const [principal, setPrincipal] = useState<string | undefined>(undefined);
    const [avatar, setAvatar] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (principal_or_account === undefined) {
            setPrincipal(undefined);
            setAvatar(undefined);
            return;
        }
        getUserProfile(principal_or_account).then((profile) => {
            setPrincipal(
                profile?.principal ?? isPrincipalText(principal_or_account)
                    ? principal_or_account
                    : undefined,
            );
            setAvatar(profile?.avatar);
        });
    }, [principal_or_account]);

    return {
        principal,
        avatar,
    };
};
