import { useEffect, useState } from 'react';
import SpaceCard from '../../space/components/event-card';

export default function HomeTab() {
    const [tab, setTab] = useState<1 | 2>(1);

    const [eventsList, setEventsList] = useState<any[]>([]);
    const [spacesList, setSpacesList] = useState<any[]>([]);

    useEffect(() => {
        setEventsList(['', '', '', '', '', '', '', '', '', '', '', '']);
        setSpacesList(['', '', '', '', '', '', '', '', '', '', '', '']);
    }, []);

    return (
        <div className="relative w-full">
            <div className="h-0.5 w-[1920px] bg-gradient-to-r from-blue-300 via-fuchsia-400 to-sky-200" />
            <div className="shadow-custom blur-20 h-4 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500"></div>

            <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
                <div className="mt-[20px] flex w-full md:mt-[80px]">
                    <span
                        onClick={() => setTab(1)}
                        className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white/70 duration-300 md:text-[28px] ${
                            tab === 1 && '!text-white'
                        }`}
                    >
                        Events
                        {tab === 1 && (
                            <i className="absolute -bottom-[10px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-white md:h-[8px] md:w-[8px]"></i>
                        )}
                    </span>
                    <span
                        onClick={() => setTab(2)}
                        className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white/70 duration-300 md:text-[28px] ${
                            tab === 2 && '!text-white'
                        }`}
                    >
                        Spaces
                        {tab === 2 && (
                            <i className="absolute -bottom-[10px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-white md:h-[8px] md:w-[8px]"></i>
                        )}
                    </span>
                </div>
                {tab === 1 && (
                    <div className="mt-[30px] grid grid-cols-2 gap-x-[15px] gap-y-[15px] md:mt-[50px] md:grid-cols-2 md:gap-x-[30px] md:gap-y-[30px] lg:grid-cols-3 xl:grid-cols-4">
                        {eventsList.map((_, index) => (
                            <SpaceCard key={index} info={_} />
                        ))}
                    </div>
                )}
                {tab === 2 && (
                    <div className="mt-[30px] grid grid-cols-2 gap-x-[15px] gap-y-[15px] md:mt-[50px] md:grid-cols-2 md:gap-x-[30px] md:gap-y-[30px] lg:grid-cols-3 xl:grid-cols-4">
                        {spacesList.map((_, index) => (
                            <SpaceCard key={index} info={_} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
