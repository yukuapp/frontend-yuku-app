import { useEffect, useState } from 'react';
import { queryUserMetadata } from '@/utils/apis/yuku/api';
import { queryProfileByPrincipalOrAccountHex } from '@/utils/canisters/yuku-old/core';
import { parse_nft_identifier } from '@/common/nft/ext';
import { ProfileTab, profileToView, UsedProfile } from './common';
import ProfileContent from './content';
import ProfileHeader from './header';

function Profile({
    principal,
    account,
    tab,
}: {
    principal: string | undefined;
    account: string;
    tab: ProfileTab;
}) {
    // console.log('Profile', principal, tab);

    const [profileLoading, setProfileLoading] = useState(true);
    const [usedProfile, setUsedProfile] = useState<UsedProfile>({
        principal: undefined,
        account: '',
        avatar: '/img/profile/default-avatar.png' || '',
        username: '',
        bio: '',
        created: [],
        favorited: [],
    });

    useEffect(() => {
        setProfileLoading(true);
        (async () => {
            try {
                const yuku_metadata = await queryUserMetadata({ id: principal ?? account });
                const yuku_profile = await queryProfileByPrincipalOrAccountHex(
                    principal ?? account,
                );
                setUsedProfile({
                    principal: yuku_profile.principal,
                    account: yuku_profile.account,
                    avatar: yuku_metadata?.avatar ?? '/img/profile/default-avatar.png' ?? '',
                    username: yuku_metadata?.name ?? '',
                    bio: yuku_metadata?.bio ?? '',
                    created: yuku_profile.created.map((i) => parse_nft_identifier(i)),
                    favorited: yuku_profile.favorited.map((i) => parse_nft_identifier(i)),
                });
            } catch (error) {
                console.debug(`🚀 ~ file: profile.tsx:59 ~ useEffect ~ e:`, error);

                setUsedProfile({
                    principal: principal,
                    account: account,
                    avatar: '/img/profile/default-avatar.png' || '',
                    username: principal ?? account,
                    bio: '',
                    created: [],
                    favorited: [],
                });
            } finally {
                setProfileLoading(false);
            }
        })();
    }, [principal, account]);

    return (
        <>
            <ProfileHeader profileLoading={profileLoading} view={profileToView(usedProfile)} />
            <ProfileContent
                principal={usedProfile?.principal ?? principal}
                account={account}
                tab={tab}
                created={usedProfile.created}
                favorited={usedProfile.favorited}
            />
        </>
    );
}

export default Profile;
