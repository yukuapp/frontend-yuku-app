import { Skeleton } from 'antd';
import { LaunchpadCollectionInfo } from '@/canisters/yuku-old/yuku_launchpad';
import { cdn } from '@/common/cdn';
import '../index.less';

export const LaunchpadProjectTeam = ({ info }: { info: LaunchpadCollectionInfo }) => {
    const { team } = info;
    let json: any;
    try {
        json = JSON.parse(team);
    } catch (e) {
        json = {};
    }
    return (
        <>
            <div className="mb-[10px] mt-5 flex items-center md:mb-[30px]">
                <img
                    className="h-[50px] w-[50px] rounded-[8px]"
                    src={cdn(info.teamImages.length ? info.teamImages[0] : info.featured)}
                    alt=""
                />
                <p className="ml-2 text-[16px] font-semibold text-white">{json.name}</p>
            </div>
            <div className="article">
                <p className="mb-[15px] text-[14px] text-white/60 md:mb-6">{json.desc}</p>
                <p className="mb-[10px] mt-[20px] text-[24px] font-semibold text-white md:mb-5 md:mt-[50px]">
                    Project Description
                </p>
                <p className="mb-[15px] text-[14px] text-white/60 md:mb-6">{info.production}</p>
            </div>
        </>
    );
};

export const LaunchpadProjectTeamSkeleton = () => {
    return (
        <>
            <div className="mt-5 flex items-center">
                <Skeleton.Button className="!h-[50px] !w-[50px]" />
                <Skeleton.Input className="ml-3 !h-4 !w-[180px] !min-w-0" />
            </div>
            <div className="article">
                <Skeleton.Input className="mt-1 !h-4 !w-full !min-w-0 md:mt-2" />
                <Skeleton.Input className="mt-1 !h-4 !w-full !min-w-0 md:mt-2" />
                <Skeleton.Image className="mt-1 !h-[150px] !w-full md:mt-2 md:!h-[250px]" />
                <Skeleton.Input className="mt-1 !h-4 !w-full !min-w-0 md:mt-2" />
                <Skeleton.Input className="mt-1 !h-4 !w-full !min-w-0 md:mt-2" />
            </div>
        </>
    );
};
