import { useEffect, useState } from 'react';
import SpaceCard, { SpaceInfo } from '@/components/spaceCard';

const spaceList: SpaceInfo[] = [
    {
        id: 1,
        title: 'Premier Golf Club',
        creator: '',
        time: '',
        link: '/scene?sku=5caef3a83b05a5c32ac8062e4a34a064',
    },
    {
        id: 2,
        title: '3D Art Gallery',
        creator: '',
        time: '',
        link: '/scene?type=6&map=Gallery',
    },
    {
        id: 3,
        title: 'Orbit Live Hall',
        creator: '',
        time: '',
        link: '/scene?type=6&map=LiveHall',
    },
    {
        id: 4,
        title: 'The GoldDao',
        creator: '',
        time: '',
        link: '/scene?sku=8419705d6257f348a1dbd94fc6da17d2',
    },
];

export default function FeaturedSpaces() {
    const [spacesList, setSpacesList] = useState<any[]>([]);

    useEffect(() => {
        setSpacesList(spaceList);
    }, []);

    return (
        <div>
            <div className="relative w-full pb-[80px]">
                <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
                    <div className="mt-[20px] flex w-full items-center justify-between md:mt-[80px]">
                        <span
                            className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white duration-300 md:text-[28px]`}
                        >
                            Featured Spaces
                        </span>
                    </div>

                    <div
                        className="
                            mt-[20px] flex w-full gap-x-[15px]
                            gap-y-[15px] overflow-x-scroll md:mt-[50px] md:grid
                            md:grid-cols-2 md:gap-x-[30px] md:gap-y-[30px] md:overflow-y-visible lg:grid-cols-3 xl:grid-cols-4
                        "
                    >
                        {spacesList.map((item, index) => (
                            <SpaceCard
                                key={index}
                                info={item}
                                cover={`/img/metaverse/feature_space_${item.id}.png`}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
