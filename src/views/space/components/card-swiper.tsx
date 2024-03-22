import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import _ from 'lodash';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperType } from 'swiper/types';
import { useWindowSize } from 'usehooks-ts';
import { SpaceEvent } from '@/apis/yuku/api';
import { cn } from '@/common/cn';
import EventCard from './event-card';

export const SLIDE_SIZE: [number, number][] = [
    [2550, 4],
    [1920, 4],
    [1440, 4],
    [1024, 3],
    [0, 2],
];

export default function CardSwiper({
    wrapperClass,
    size,
    list,
    loading,
}: {
    wrapperClass: string;
    size: number | ((width: number) => number) | [number, number][];
    list: SpaceEvent[];
    loading?: boolean;
}) {
    const [cardSwiper, setCardSwiper] = useState<SwiperType | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const { width } = useWindowSize();

    const [slideSize, setSlideSize] = useState(10);

    const [swiperOverFlow, setSwiperOverFlow] = useState<'!overflow-hidden' | '!overflow-visible'>(
        '!overflow-hidden',
    );
    useEffect(() => {
        if (typeof size === 'number') return setSlideSize(size);
        if (typeof size === 'function') return setSlideSize(size(width));
        if (_.isArray(size)) {
            return setSlideSize(() => {
                for (const item of size) {
                    if (item[0] <= width) return item[1];
                }
                return 4;
            });
        }
        setSlideSize(4);
    }, [size, width]);

    const totalPage = Math.ceil(list.length / slideSize);

    const lastPageSize = slideSize - totalPage * slideSize + list.length;
    const lastPageIndexArr: number[] = [];

    for (let i = 0; i < slideSize - lastPageSize; i++) {
        lastPageIndexArr.push(list.length - 1 - lastPageSize - i);
    }

    const currentPage = Math.ceil(currentIndex / slideSize);

    const onSlideChange = (e: any) => {
        setCurrentIndex(e.realIndex);
        setSwiperOverFlow('!overflow-hidden');
    };

    return (
        <div className={cn('group relative', wrapperClass)}>
            {loading ? (
                <div className="grid grid-cols-2 gap-x-[31px] lg:grid-cols-3 xl:grid-cols-4">
                    {new Array(slideSize).fill('').map(() => (
                        <EventCard></EventCard>
                    ))}
                </div>
            ) : (
                <>
                    <div
                        className={cn(
                            'absolute bottom-0 left-[-35px] top-0 z-10 flex w-[25px] cursor-pointer rounded-[16px] bg-transparent hover:bg-[#1E2437]',
                            currentPage === 0 && 'hidden',
                            isMobile && 'hidden',
                        )}
                        onClick={() => cardSwiper?.slidePrev(1000)}
                    >
                        <img
                            src="/img/space/arrow-swiper.svg"
                            className={cn(
                                'm-auto hidden rotate-180',
                                currentPage > 0 && 'group-hover:block',
                            )}
                            alt=""
                        />
                    </div>
                    <Swiper
                        className={cn('!w-full cursor-pointer', swiperOverFlow)}
                        direction="horizontal"
                        slidesPerView={slideSize}
                        slidesPerGroup={slideSize}
                        // loop={true}
                        spaceBetween={31}
                        // autoplay={{
                        //     disableOnInteraction: true,
                        //     delay: 3000,
                        // }}
                        // modules={[Autoplay]}
                        onSwiper={(swiper) => setCardSwiper(swiper)}
                        onSlideChange={onSlideChange}
                    >
                        {list.map((l, i) => {
                            return (
                                <SwiperSlide
                                    key={'card-swiper' + l.id + i}
                                    className={cn(
                                        'invisible hover:z-10',
                                        Math.floor(i / slideSize) === currentPage && 'visible',
                                        currentPage === totalPage - 1 &&
                                            lastPageIndexArr.indexOf(i) !== -1 &&
                                            'visible',
                                    )}
                                    onMouseOver={() => {
                                        setSwiperOverFlow('!overflow-visible');
                                    }}
                                >
                                    <EventCard info={l}></EventCard>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                    <div
                        className={cn(
                            'absolute -right-[35px] bottom-0 top-0 z-10 flex w-[25px] cursor-pointer rounded-[16px] bg-transparent hover:bg-[#1E2437]',
                            currentPage === totalPage - 1 && 'hidden',
                            isMobile && 'hidden',
                        )}
                        onClick={() => cardSwiper?.slideNext(1000)}
                    >
                        <img
                            src="/img/space/arrow-swiper.svg"
                            className={cn(
                                'm-auto hidden',
                                totalPage > 1 &&
                                    currentPage !== totalPage - 1 &&
                                    'group-hover:block',
                            )}
                            alt=""
                        />
                    </div>
                </>
            )}
        </div>
    );
}
