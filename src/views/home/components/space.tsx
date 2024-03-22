import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SpaceCard, { SpaceInfo } from '@/components/spaceCard';
import { useIdentityStore } from '@/stores/identity';

const spaceList: SpaceInfo[] = [
    {
        id: 1,
        title: 'Dfinity Space',
        creator: '',
        time: '',
        link: '/scene?type=6&map=Dfinity',
    },
    {
        id: 2,
        title: 'Yuku Space',
        creator: '',
        time: '',
        link: '/scene?type=6&map=Yuku',
    },
    {
        id: 3,
        title: 'MCC World',
        creator: '',
        time: '',
        link: '/scene?type=6&map=Mcc001',
    },
    {
        id: 5,
        title: 'University of Zurich Blockchain Center',
        creator: '',
        time: '',
        cover: 'https://cdn.yuku.app/ugc/creatortoolkit/8427388134207733/Space/suLiShi_01/webgl/thumbnail.png?&url=https%3A%2F%2Fclient.obs.eu-west-101.myhuaweicloud.eu%2Fugc%2Fcreatortoolkit%2F8427388134207733%2FSpace%2FsuLiShi_01%2Fwebgl%2Fthumbnail.png',
        link: '/space/3165035454443150',
    },
    {
        id: 4,
        title: 'DOJO of Web3',
        creator: '',
        time: '',
        link: '/scene?sku=0dcfdb5c7b6516dbbb884897b9d9960b',
    },
];

export default function HomeSpace() {
    const [spacesList, setSpacesList] = useState<any[]>([]);

    useEffect(() => {
        setSpacesList(spaceList);
    }, []);
    const domain = window.location;
    const principal = useIdentityStore((s) => s.identityProfile?.principal);

    return (
        <div>
            {principal && (
                <iframe
                    className="invisible absolute"
                    src={`${domain}profile/${principal}/collected`}
                ></iframe>
            )}
            <div className="relative mb-[-20px] w-full pb-[80px] sm:pb-[140px]">
                <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
                    <div className="mt-[50px] flex w-full items-center justify-between md:mt-[80px]">
                        <span
                            className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-inter-bold text-[20px] text-white duration-300 md:text-[28px]`}
                        >
                            Popular Spaces
                        </span>
                        <span className="btnHover cursor-pointer rounded-[8px] border border-[#3B4E7F] px-[15px] py-[8px] font-inter-bold text-[16px]">
                            <Link to="/3DSpace">View More</Link>
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
                                cover={item.cover ?? `/img/home/space_${item.id}.png`}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
