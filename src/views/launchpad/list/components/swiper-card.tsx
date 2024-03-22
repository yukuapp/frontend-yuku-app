import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CountdownRenderer from '@/components/countdown/render';
import YukuIcon from '@/components/ui/yuku-icon';
import {
    getLaunchpadCollectionStatus,
    LaunchpadCollectionInfo,
} from '@/canisters/yuku-old/yuku_launchpad';
import { cdn } from '@/common/cdn';
import { exponentNumber } from '@/common/data/numbers';

const SwiperCard = ({ info }: { info: LaunchpadCollectionInfo }) => {
    const { t } = useTranslation();

    const next = Number(
        exponentNumber(
            getLaunchpadCollectionStatus(info) === 'whitelist' ? info.whitelist_end : info.open_end,
            -6,
        ),
    );

    return (
        <>
            <div className="z-2 absolute left-0 top-0 h-full w-full"></div>
            <img
                className="relative z-10 w-1/2 rounded-[16px] md:h-[365px] md:w-[365px]"
                src={cdn(info.featured)}
                alt=""
            />
            <div className="relative z-10 flex flex-col px-[22px] md:ml-[74px] md:w-1/2 md:px-[50px] ">
                <p className="mt-7 text-center text-[18px] font-semibold leading-[100%] text-white md:mt-0 md:text-left md:text-[32px]">
                    {info.name}
                </p>
                <p className="mt-[17px] line-clamp-3 text-center leading-5 text-white/60 md:mt-2 md:text-left">
                    {info.description}
                </p>
                <span className="mt-[17px] flex items-center justify-center md:mt-[30px] md:justify-start">
                    <Link to={`/launchpad/${info.collection}`}>
                        <p className="text-[16px] font-semibold leading-5 text-white">
                            {t('launchpad.main.more')}
                        </p>
                    </Link>
                    <YukuIcon name="arrow-right" className="ml-2 text-white" />
                </span>
                <div className="mt-[20px] w-full  items-center text-[16px] md:mt-[57px]">
                    <p className="text-center font-semibold text-white md:items-center md:text-left">
                        {t('launchpad.main.endIn')}
                    </p>
                    <div className="mt-4 flex w-full justify-center md:justify-start">
                        <Countdown date={next} renderer={CountdownRenderer} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default SwiperCard;
