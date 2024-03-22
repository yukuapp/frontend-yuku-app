import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Credit from '@/components/user/credit';
import {
    useArtistCollectionIdList,
    useCollectionDataList,
    useCoreCollectionIdList,
} from '@/hooks/nft/collection';
import { cn } from '@/common/cn';
import { NftIdentifier } from '@/types/nft';
import { ProfileTab } from './common';
import ProfileActivity from './tabs/activity';
import ProfileAuction from './tabs/auction';
import ProfileCollected from './tabs/collected';
import ProfileCreated from './tabs/created';
import ProfileFavorite from './tabs/favorite';

const ALL_TABS: { type: ProfileTab; show: string }[] = [
    { type: 'collected', show: 'Collected' },
    // { type: 'created', show: 'Created' },
    { type: 'favorite', show: 'Favorites' },
    { type: 'activity', show: 'Activity' },
    { type: 'auction', show: 'Bid Records' },
];

function ProfileContent({
    principal,
    account,
    tab,
    created,
    favorited,
}: {
    principal: string | undefined;
    account: string;
    tab: ProfileTab;
    created: NftIdentifier[];
    favorited: NftIdentifier[];
}) {
    const navigate = useNavigate();

    const coreCollectionIdList = useCoreCollectionIdList();
    const artistCollectionIdList = useArtistCollectionIdList();
    const collectionDataList = useCollectionDataList();

    const idList = [...(coreCollectionIdList ?? []), ...(artistCollectionIdList ?? [])];

    const [currentTab, setCurrentTab] = useState<ProfileTab>(tab);
    useEffect(() => setCurrentTab(tab), [tab]);

    const onTab = (tab: ProfileTab) => {
        if (currentTab === tab) return;
        console.debug('change tab ->', tab);
        navigate(`/profile/${principal ?? account}/${tab}`, { replace: true });
        setCurrentTab(tab);
    };

    // self
    // const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    // const self = !!connectedIdentity && principal === connectedIdentity.principal;

    // const toggleShowBatchSellSidebar = useIdentityStore((s) => s.toggleShowBatchSellSidebar);

    if ((coreCollectionIdList ?? []).length === 0) return <></>;
    if ((artistCollectionIdList ?? []).length === 0) return <></>;
    if ((collectionDataList ?? []).length === 0) return <></>;

    return (
        <div className="mt-[25px] px-[15px] md:mt-[30px] md:px-[40px]">
            <div className="mb-[25px] flex w-full items-center justify-between md:hidden">
                <Credit account={account} className="flex flex-col gap-y-2 md:hidden" />
            </div>
            <div className="relative box-border flex items-end justify-between overflow-hidden px-0">
                <div className="absolute left-0 right-0 h-1 border-b-[2px] border-[#262E47]"></div>
                <div className=" flex w-full justify-between gap-x-[34px] overflow-x-scroll md:w-auto md:gap-x-[92px] md:overflow-x-hidden">
                    {ALL_TABS.map((t) => {
                        return (
                            <div
                                className={cn([
                                    'relative mb-[30px] flex h-[46px] cursor-pointer items-center justify-center whitespace-nowrap rounded-[8px] bg-transparent px-[17px] text-[12px] font-bold text-white duration-300 md:text-[18px]',
                                    currentTab === t.type && 'bg-[#1C2234] duration-300',
                                ])}
                                onClick={() => onTab(t.type)}
                                key={t.type}
                            >
                                {t.show}
                            </div>
                        );
                    })}
                </div>
            </div>
            {idList.length && (
                <>
                    <ProfileCollected
                        showed={currentTab === 'collected'}
                        principal={principal}
                        account={account}
                        idList={idList}
                        collectionDataList={collectionDataList}
                    />
                    <ProfileCreated
                        showed={currentTab === 'created'}
                        collectionDataList={collectionDataList}
                        created={created}
                    />
                    <ProfileFavorite
                        showed={currentTab === 'favorite'}
                        account={account}
                        collectionDataList={collectionDataList}
                        favorited={favorited}
                    />
                    <ProfileActivity showed={currentTab === 'activity'} account={account} />
                    <ProfileAuction showed={currentTab === 'auction'} principal={principal} />
                </>
            )}
        </div>
    );
}

export default ProfileContent;
