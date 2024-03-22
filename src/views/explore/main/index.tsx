import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FirstRenderByData } from '@/common/react/render';
import './index.less';
import ExploreArt from './tabs/art';
import ExploreCollectibles from './tabs/collectibles';
import ExploreOat from './tabs/oat';

type ExploreTab = 'collectibles' | 'oat' | 'art';
const EXPLORE_TABS: ExploreTab[] = ['collectibles', 'oat', 'art'];
export const isValidExploreTab = (tab: string): boolean => EXPLORE_TABS.includes(tab as ExploreTab);

type NavigateItem = {
    label: string;
    path: string;
};

function ExploreMainPage({ show = true }: { show: boolean }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const tabs: NavigateItem[] = [
        {
            label: t('home.nav.collectibles'),
            path: '/marketplace/explore',
        },
        {
            label: t('home.nav.oat'),
            path: '/marketplace/explore/oat',
        },
        {
            label: t('home.nav.art'),
            path: '/marketplace/explore/art',
        },
    ];

    const param = useParams();
    const tab: ExploreTab = param.second ? (param.second as ExploreTab) : 'collectibles';
    const [once_check_params] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_check_params.once([tab], () => {
                if (!isValidExploreTab(tab))
                    return navigate('/marketplace/explore', { replace: true });
            }),
        [tab],
    );
    if (!show) {
        return <></>;
    }
    return (
        <>
            <div className="mx-auto flex w-full flex-col ">
                <div className="flex flex-col">
                    {/* TAB */}
                    <div className="flex">
                        {tabs.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className={`mr-9 flex h-[35px] cursor-pointer items-center rounded-[8px] px-3 font-inter-semibold text-[16px] text-white/60 duration-100 ${
                                    location.pathname === item.path && 'bg-[#1C2234] !text-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                    <div className="mb-[20px] mt-[20px] h-px w-full bg-[#262e47] md:mb-[30px] md:mt-[30px]" />
                    {<ExploreCollectibles show={tab === 'collectibles'} />}
                    {<ExploreOat show={tab === 'oat'} />}
                    {<ExploreArt show={tab === 'art'} />}
                </div>
            </div>
        </>
    );
}

export default ExploreMainPage;
