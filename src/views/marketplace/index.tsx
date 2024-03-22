import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/common/cn';
import { FirstRenderByData } from '@/common/react/render';
import ActivityMainPage from '../activity/index';
import ExploreMainPage from '../explore/main';
import LaunchpadListPage from '../launchpad/list';
import './index.less';

type ExploreTab = 'explore' | 'launchpad' | 'activity';
const EXPLORE_TABS: ExploreTab[] = ['explore', 'launchpad', 'activity'];
export const isValidExploreTab = (tab: string): boolean => EXPLORE_TABS.includes(tab as ExploreTab);

type NavigateItem = {
    label: string;
    path: string;
};

function MarketplaceMainPage() {
    const navigate = useNavigate();

    const tabs: NavigateItem[] = [
        {
            label: 'Explore',
            path: '/marketplace/explore',
        },
        {
            label: 'Launchpad',
            path: '/marketplace/launchpad',
        },
        {
            label: 'Activity',
            path: '/marketplace/activity',
        },
    ];

    const param = useParams();
    const tab: ExploreTab = param.first ? (param.first as ExploreTab) : 'explore';
    const [once_check_params] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_check_params.once([tab], () => {
                if (!isValidExploreTab(tab))
                    return navigate('/marketplace/explore', { replace: true });
            }),
        [tab],
    );

    return (
        <>
            <div className="mx-auto flex w-full flex-col ">
                <div className="mx-[16px] flex flex-col md:mx-[40px]">
                    {/* TAB */}
                    <div className="mt-[23px] flex gap-x-6 md:gap-x-12">
                        {tabs.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className={cn(
                                    'relative flex h-[25px] cursor-pointer items-center font-inter-semibold text-[18px] text-white/60 duration-100 md:text-[24px]',
                                    location.pathname.indexOf(item.path) !== -1 && 'text-white',
                                )}
                            >
                                {location.pathname.indexOf(item.path) !== -1 && (
                                    <div className="absolute -bottom-[11px] h-[2px] w-full bg-white md:-bottom-[20px]"></div>
                                )}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mb-[20px] mt-[10px] h-px w-full bg-[#262e47] md:mb-[30px] md:mt-[20px]" />
                    <ExploreMainPage show={tab === 'explore'}></ExploreMainPage>
                    <LaunchpadListPage show={tab === 'launchpad'}></LaunchpadListPage>
                    <ActivityMainPage show={tab === 'activity'}></ActivityMainPage>
                </div>
            </div>
        </>
    );
}

export default MarketplaceMainPage;
