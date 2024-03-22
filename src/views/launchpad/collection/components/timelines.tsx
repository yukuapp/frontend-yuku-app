import { Skeleton, Timeline } from 'antd';
import { LaunchpadCollectionInfo } from '@/canisters/yuku-old/yuku_launchpad/index';
import { formatDateByNano } from '@/common/data/dates';
import { exponentNumber } from '@/common/data/numbers';

export const LaunchpadProjectTimelines = ({ info }: { info: LaunchpadCollectionInfo }) => {
    const { whitelist_start, whitelist_end, open_start, open_end } = info;
    const items = [
        {
            color: 'white',
            children: (
                <div className="mb-[15px] flex flex-col">
                    <h2 className="mb-3 text-[16px] font-semibold text-white">
                        Whitelist Sale Info
                    </h2>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Starts: {formatDateByNano(whitelist_start)}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Ends: {formatDateByNano(whitelist_end)}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        NFT amount: {info.whitelist_supply}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Price: {exponentNumber(info.whitelist_price, -8)} ICP
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Limit: {info.whitelist_limit}
                    </p>
                </div>
            ),
        },
        {
            color: 'white',
            children: (
                <div className="mb-[15px] flex flex-col">
                    <h2 className="mb-3 text-[16px] font-semibold text-white">Public Sale Info</h2>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Starts: {formatDateByNano(open_start)}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Ends: {formatDateByNano(open_end)}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        NFT amount: {info.open_supply}
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Price: {exponentNumber(info.open_price, -8)} ICP
                    </p>
                    <p className="mb-[13px] text-[14px] text-white/60">
                        Limit: {info.open_limit === undefined ? 'No Limit' : info.open_limit}
                    </p>
                </div>
            ),
        },
        // {
        //     color: 'gray',
        //     children: (
        //         <div className="mb-[15px] flex flex-col">
        //             <h2 className="mb-3 text-[14px] font-semibold text-white">
        //                 Whitelist Sale Info
        //             </h2>
        //             <p className="mb-[13px] text-[12px] text-white/60">Technical testing 2</p>
        //             <p className="mb-[13px] text-[12px] text-white/60">
        //                 Technical testing 3 2015-09-01
        //             </p>
        //         </div>
        //     ),
        // },
    ];

    return (
        <>
            <Timeline items={items} />
        </>
    );
};

export const LaunchpadProjectTimelinesSkeleton = () => {
    const item = {
        color: 'white',
        children: (
            <div className="mb-[15px] flex flex-col">
                <Skeleton.Input className="mb-1 ml-3 !h-4 !w-[180px] !min-w-0 md:mb-2" />
                <Skeleton.Input className="mb-1 ml-3 !h-4 !w-[180px] !min-w-0 md:mb-2" />
                <Skeleton.Input className="ml-3 !h-4 !w-[180px] !min-w-0" />
            </div>
        ),
    };
    const items: { color: string; children: any }[] = [];
    for (let i = 0; i < 3; i++) {
        items.push(item);
    }

    return (
        <>
            <Timeline items={items} />
        </>
    );
};
