import { useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/common/cn';

const bannerList: { src: string; creator: string; time: string }[] = [
    {
        src: 'https://via.placeholder.com/889x559',
        creator: 'JING HUI LIU',
        time: 'DEC 08,2023</div>',
    },
    {
        src: 'https://via.placeholder.com/889x559',
        creator: 'JING HUI LIUqwewq',
        time: 'DEC 08,2023</div>',
    },
    {
        src: 'https://via.placeholder.com/889x559',
        creator: 'JING HUI LIUqwew32q',
        time: 'DEC 08,2023</div>',
    },
];

export default function Banner() {
    const [bannerSwiper, setBannerSwiper] = useState<SwiperType | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const onSlideChange = (e: any) => setCurrentPage(e.realIndex);
    return (
        <>
            <div className="relative flex h-[700px] w-full flex-col  justify-center gap-y-[82px] rounded-tl-[40px] rounded-tr-[40px] bg-gradient-to-bl from-[#8E3FBF] to-[#3A5782] 2xl:h-[900px]">
                <div className="absolute bottom-0 h-[190px] w-full bg-gradient-to-b from-transparent to-gray-900" />
                <Swiper
                    className="!w-full cursor-pointer"
                    direction="horizontal"
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                    }}
                    initialSlide={0}
                    modules={[Autoplay]}
                    onSwiper={(swiper) => setBannerSwiper(swiper)}
                    onSlideChange={onSlideChange}
                >
                    {bannerList.map((item) => {
                        return (
                            <SwiperSlide key={item.creator + item.time} className="flex px-[10px]">
                                <div className="m-auto flex w-fit items-center justify-between gap-x-20">
                                    <img
                                        className="h-[500px] w-[600px] rounded-[40px] 2xl:h-[559px] 2xl:w-[889px]"
                                        src="https://via.placeholder.com/889x559"
                                    />
                                    <div className="flex flex-col justify-center gap-y-32">
                                        <div className="w-[414px]">
                                            <span className="font-inter-semibold text-[58px] leading-[80px] text-white">
                                                Abstract
                                            </span>
                                            <br />
                                            <span className="font-inter-semibold text-[58px] lowercase leading-[80px] text-white">
                                                Space Imagine
                                            </span>
                                        </div>
                                        <Button
                                            className="h-12 w-36 rounded-[8px] bg-transparent from-blue-400 to-purple-600 font-inter-semibold text-base transition-all duration-300 hover:bg-transparent hover:!bg-gradient-to-r hover:!shadow-[0px_1px_60px_#D428FF,inset_0_0_13px_#141A2A80]"
                                            style={{
                                                background:
                                                    'linear-gradient(98deg, rgba(118, 152, 255, 0.30) 0%, rgba(250, 56, 255, 0.30) 52%, rgba(138, 26, 255, 0.30) 100%)',
                                                boxShadow:
                                                    '0px 1px 60px #D428FF,inset 0 0 10px #101522',
                                            }}
                                        >
                                            Enter
                                        </Button>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
                <div className="relative mx-auto flex w-fit gap-x-4">
                    {bannerList.map((b, i) => (
                        <div
                            key={`banner-${b.creator}-${b.time}`}
                            className={cn(
                                'h-3.5 w-3.5 cursor-pointer rounded-full border border-white border-opacity-80 transition-all duration-300 hover:bg-white',
                                currentPage === i && 'bg-white',
                            )}
                            onClick={() => {
                                bannerSwiper?.slideToLoop(i);
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
