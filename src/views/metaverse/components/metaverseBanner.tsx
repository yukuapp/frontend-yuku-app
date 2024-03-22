import { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Progress } from 'antd';
import 'swiper/css';
import 'swiper/css/free-mode';
import { EffectFade, FreeMode } from 'swiper/modules';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

export const venueArr = [
    {
        id: 1,
        name: 'Dfinity Space',
        bgImg: `/img/metaverse/banner/dfinity_banner.jpeg`,
        desc: "Captivating showcase of Dfinity's technologies and collaborative culture. Immerse yourself in where creativity meets WEB3.",
    },
    {
        id: 2,
        name: 'Yuku Space',
        bgImg: `/img/metaverse/banner/yuku_banner.jpeg`,
        desc: 'Step into the Yuku Space, a NFT museum where each exhibit tells a unique story. A testament to the art of curation, seeing the artist creation in space.',
    },
    {
        id: 3,
        name: 'MCC Art World',
        bgImg: `/img/metaverse/banner/mcc_banner.jpeg`,
        desc: "A gallery curated by Conor McCreedy. Unveil a world where imagination knows no bounds. Conor McCreedy's personal art gallery delivers an unparalleled art show.",
    },
    {
        id: 4,
        name: 'Lecture Hall',
        bgImg: `/img/metaverse/banner/leisure-banner.jpeg`,
        desc: 'Explore the educational frontier in the Lecture Hall. This virtual space is dedicated to the pursuit of knowledge, providing a platform for interactive learning experiences.',
    },
    {
        id: 5,
        name: 'Yuku Live',
        bgImg: `/img/metaverse/banner/shikulive_banner.jpeg`,
        desc: 'Yuku Live is a revolutionary conference tool that brings the excitement and engagement of the metaverse to your next virtual event. With its immersive and interactive features, Yuku Live enables you to connect with your audience in new and exciting ways.',
    },
    {
        id: 6,
        name: 'Metalangelo Space',
        bgImg: `/img/metaverse/banner/metalangelo_banner.jpeg`,
        desc: 'Behold the Metalangelo Space, a virtual flagship store that goes beyond conventional branding. Step into an immersive showcase where the essence of the brand comes to life.',
    },
];

const arr = [
    {
        name: 'Dfinity Space',
        cur_url: `/img/metaverse/banner/dfinity_1.jpg`,
        url: `/img/metaverse/banner/dfinity_0.jpg`,
        id: 1,
    },
    {
        name: 'Yuku Space',
        cur_url: `/img/metaverse/banner/yuku_1.jpg`,
        url: `/img/metaverse/banner/yuku_0.jpg`,
        id: 2,
    },
    {
        name: 'MCC Art World',
        cur_url: `/img/metaverse/banner/mcc_1.jpg`,
        url: `/img/metaverse/banner/mcc_0.jpg`,
        id: 3,
    },
    {
        name: 'Lecture Hall',
        cur_url: `/img/metaverse/banner/leisure_1.jpg`,
        url: `/img/metaverse/banner/leisure_0.jpg`,
        id: 4,
    },
    {
        name: 'Yuku Live',
        cur_url: `/img/metaverse/banner/shikulive_1.jpg`,
        url: `/img/metaverse/banner/shikulive_0.jpg`,
        id: 5,
    },
    {
        name: 'Metalangelo Space',
        cur_url: `/img/metaverse/banner/metalangelo_1.jpg`,
        url: `/img/metaverse/banner/metalangelo_0.jpg`,
        id: 6,
    },
];

export const FlowerLoading = () => {
    return (
        <div className="loading-container">
            <svg className="loading" viewBox="25 25 50 50">
                <circle className="circle" cx="50" cy="50" r="20"></circle>
            </svg>
        </div>
    );
};

export const LazyImage = (props) => {
    const [loadingImages, setLoadingImages] = useState(true);

    useEffect(() => {
        const image = new Image();
        image.src = props.src;

        image.onload = () => {
            setLoadingImages(false);
        };
    }, [props.src]);
    return (
        <>
            {!loadingImages ? (
                <LazyLoadImage className={props.className} src={props.src} alt=""></LazyLoadImage>
            ) : (
                <div className={`${props.className} lazy-default-style`}>
                    <div className="root-common-loading">
                        <FlowerLoading />
                    </div>
                </div>
            )}
        </>
    );
};

export default function MetaverseBanner() {
    const [swiperIdx, setSwiperIdx] = useState<number>(0);
    const swiperRef = useRef<SwiperRef>(null);
    const [, setInfo] = useState(venueArr[0]);

    const [percent, setPercent] = useState<number>((100 * 1) / 6);

    const skip = (index) => {
        setSwiperIdx(index);
        setInfo(venueArr[index]);
        swiperRef.current?.swiper.slideTo(index);
    };

    const setSwiper = (e) => {
        setSwiperIdx(e.realIndex);
        setInfo(venueArr[e.realIndex]);
        swiperRef.current?.swiper.slideTo(e.realIndex);
    };

    useEffect(() => {
        setPercent((100 / 6) * (swiperIdx + 1));
    }, [swiperIdx]);

    return (
        <div className="architecture-wrap-head mb-[150px] sm:mb-0">
            <Swiper
                ref={swiperRef}
                spaceBetween={0}
                modules={[FreeMode, EffectFade]}
                className="mySwiper2"
                onSwiper={setSwiper}
                onSlideChange={setSwiper}
                wrapperClass="!h-[250px] sm:!h-[640px]"
            >
                {venueArr.map((info) => {
                    return (
                        <SwiperSlide key={info.id}>
                            <div className="relative">
                                <div className="absolute bottom-[45%] z-[11] w-full translate-y-1/2 px-[20px] font-inter-bold sm:bottom-[140px] sm:translate-y-0">
                                    <div className="mx-auto h-max max-w-[1280px]">
                                        <p className="text-[28px] leading-[28px] md:max-w-[50%] md:text-[40px] md:leading-[40px]">
                                            {info && info.name ? info.name : ''}
                                        </p>
                                        <p className="mt-[10px] font-inter-medium text-[16px] leading-[20px] opacity-80 sm:mt-[20px] sm:max-w-[70%] md:leading-[24px]">
                                            {info ? info.desc : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="swiper-mask"></div>
                                <LazyImage
                                    className="flex h-[250px] w-full items-center justify-center object-cover sm:h-[640px]"
                                    src={info.bgImg}
                                    alt=""
                                ></LazyImage>
                            </div>
                        </SwiperSlide>
                    );
                })}
            </Swiper>

            <div className="absolute bottom-[45%] left-0 z-10 w-full translate-y-1/2 px-[20px] sm:bottom-[140px] sm:translate-y-0">
                <div className="mx-auto flex h-max max-w-[1280px] items-end justify-end">
                    {/* <div className="w-flex font-inter-bold md:max-w-[50%]">
                        <p className="text-[28px] leading-[28px] md:text-[40px] md:leading-[40px]">
                            {info && info.name ? info.name : ''}
                        </p>
                        <p className="mt-[10px] font-inter-medium text-[16px] leading-[20px] sm:mt-[20px] md:leading-[24px]">
                            {info ? info.desc : ''}
                        </p>
                    </div> */}
                    <div className="hidden h-[36px] w-[100px] justify-between sm:flex">
                        <div
                            className={`swiper-common-change architecture-swiper-header-box-left ${
                                swiperIdx === 0 ? 'disabled' : ''
                            }`}
                            onClick={() => {
                                if (swiperIdx === 0) return false;
                                skip(swiperIdx - 1);
                            }}
                        >
                            <img alt="" src="/img/metaverse/left.svg" />
                        </div>
                        <div
                            className={`swiper-common-change architecture-swiper-header-box-right ${
                                swiperIdx === arr.length - 1 ? 'disabled' : ''
                            }`}
                            onClick={() => {
                                if (swiperIdx === arr.length - 1) return false;
                                skip(swiperIdx + 1);
                            }}
                        >
                            <img className="opacity-60" alt="" src="/img/metaverse/right.svg" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 z-20 w-full translate-y-[80%] px-[20px] sm:bottom-[-10%] sm:mb-0 sm:translate-y-0">
                <div className="mx-auto flex h-full max-w-[1280px] overflow-x-scroll">
                    {arr.map((item, index) => {
                        return (
                            <div
                                data-aos="fade-up"
                                data-aos-duration="600"
                                data-aos-delay={100 * index}
                                key={item.id}
                                className={`relative mt-[20px] flex items-center justify-center rounded-[12px] ${
                                    index === arr.length - 1 ? 'mr-0' : 'mr-[16px]'
                                }`}
                                onClick={() => skip(index)}
                            >
                                <LazyImage
                                    className="flex h-[128px] min-w-[200px] cursor-pointer items-center justify-center rounded-[12px] object-cover"
                                    src={Number(swiperIdx) === index ? item.cur_url : item.url}
                                    alt=""
                                ></LazyImage>
                                <div className="absolute bottom-[12px] left-[50%] w-full translate-x-[-50%] text-center font-inter-bold text-[20px] leading-[20px]">
                                    {item.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="swiper-progress-bar mx-auto mt-[20px] max-w-[1280px]">
                    <Progress
                        strokeColor="#fff"
                        percent={percent}
                        showInfo={false}
                        size="small"
                        // steps={arr.length}
                    />
                </div>
            </div>
        </div>
    );
}
