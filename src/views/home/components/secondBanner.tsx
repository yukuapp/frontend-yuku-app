import { useEffect, useRef } from 'react';
import Rellax from 'rellax';

const outLinks = [
    {
        id: 1,
        link: 'https://www.gold-dao.org/',
    },
    {
        id: 2,
        link: 'https://tppkg-ziaaa-aaaal-qatrq-cai.raw.ic0.app/',
    },
    {
        id: 3,
        link: 'https://mora.app/',
    },
    {
        id: 4,
        link: 'https://icpswap.com/',
    },
    {
        id: 5,
        link: 'https://nns.ic0.app/',
    },
    {
        id: 6,
        link: 'https://yunqk-aqaaa-aaaai-qawva-cai.ic0.app/',
    },
];

export default function HomeSecondBanner() {
    const rellax = useRef<any>();
    useEffect(() => {
        init();

        return () => {
            rellax.current?.destroy();
        };
    }, []);

    const init = () => {
        rellax.current = new Rellax('.rellax');
    };

    const goNext = (item) => {
        item.link && window.open(item.link, '_blank');
    };

    return (
        <>
            <div className="relative z-20">
                <div className="shadow-custom blur-20 h-4 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500"></div>
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-300 via-fuchsia-400 to-sky-200" />
            </div>
            <section className="relative z-10 mx-auto flex h-[280px] w-full items-center justify-center sm:h-full">
                <img
                    className="mx-auto h-[280px] w-full object-fill sm:h-full"
                    src={'/img/home/dive-into-icp.png'}
                    alt=""
                />

                <div
                    className="rellax absolute left-0 top-[15%] md:left-[4vw] md:top-[20vh]"
                    data-rellax-speed="2"
                    data-rellax-xs-speed="0.8"
                    data-rellax-sm-speed="1"
                    data-rellax-md-speed="1"
                    data-rellax-percentage="0.95"
                >
                    <img
                        className="mx-auto h-[13px] w-[13px] object-cover md:h-[60px] md:w-[68px]"
                        src="/img/home/blue-square.png"
                        alt=""
                    />
                </div>
                <div
                    className="rellax absolute bottom-[35%] left-[17.5vw] z-10 md:bottom-[10vh] md:left-[17.5vw]"
                    data-rellax-speed="2"
                    data-rellax-xs-speed="0.8"
                    data-rellax-sm-speed="1"
                    data-rellax-md-speed="1"
                    data-rellax-percentage="0.95"
                >
                    <img
                        className="mx-auto h-[20px] w-[24px] object-cover md:h-[60px] md:w-[68px]"
                        src="/img/home/icon-three.png"
                        alt=""
                    />
                </div>
                <div
                    className="rellax absolute left-[32vw] top-[4%] md:top-[12vh]"
                    data-rellax-speed="2"
                    data-rellax-xs-speed="0.8"
                    data-rellax-sm-speed="1"
                    data-rellax-md-speed="1"
                    data-rellax-percentage="0.95"
                >
                    <img
                        className="mx-auto h-[30px] w-[34px] object-cover md:h-[140px] md:w-[155px]"
                        src="/img/home/shiku.png"
                        alt=""
                    />
                </div>
                <div
                    className="rellax absolute right-[28.2vw] top-[5%] md:top-[16vh]"
                    data-rellax-speed="2"
                    data-rellax-xs-speed="0.8"
                    data-rellax-sm-speed="1"
                    data-rellax-md-speed="1"
                    data-rellax-percentage="0.95"
                >
                    <img
                        className="mx-auto h-[26px] w-[29px] object-cover md:h-[80px] md:w-[90px]"
                        src="/img/home/icp.png"
                        alt=""
                    />
                </div>
                <div
                    className="rellax absolute bottom-[40%] right-[5vw] md:bottom-[10vh]"
                    data-rellax-speed="2"
                    // data-rellax-mobile-speed="0.1"
                    data-rellax-xs-speed="0.8"
                    data-rellax-sm-speed="1"
                    data-rellax-md-speed="1"
                    data-rellax-percentage="0.95"
                >
                    <img
                        className="mx-auto h-[22px] w-[29px] object-cover md:h-[60px] md:w-[68px]"
                        src="/img/home/bnb.png"
                        alt=""
                    />
                </div>

                <>
                    <div
                        data-aos="fade-right"
                        data-aos-duration="800"
                        data-aos-anchor-placement="center-bottom"
                        className="absolute bottom-0 left-0 z-0 h-[85%] w-[35%] lg:left-[10vw] lg:h-auto lg:w-[45vw] xl:left-[10vw] xl:h-auto xl:w-[45vw]"
                    >
                        <img
                            className="mx-auto h-full max-w-[750px] object-cover lg:h-auto lg:w-full 2xl:max-w-none"
                            src="/img/home/Dfinity.png"
                            alt=""
                        />
                    </div>
                    <div
                        className="
                            absolute right-0 z-10 w-[57%] max-w-[750px] overflow-hidden pr-[12px] text-center 
                            lg:right-[15vw] lg:w-[35vw] lg:text-left xl:bottom-[50%] xl:right-[10vw] xl:w-[40vw] xl:translate-y-[50%]
                        "
                    >
                        <p
                            data-aos="fade-left"
                            data-aos-duration="600"
                            className="text-left font-[Inter-Bold] text-[20px] font-bold leading-[140%] text-white sm:text-[30px] md:text-[40px] xl:text-[75px]"
                        >
                            Drive innovation into WEB3
                        </p>
                        <p
                            data-aos="fade-left"
                            data-aos-duration="800"
                            className="mt-[20px] text-left font-inter text-[12px] leading-[140%] text-white !opacity-70 md:text-[18px]"
                        >
                            Web3 offers the potential for direct interaction and transactions
                            worldwide while allowing individuals to maintain total control over
                            their personal data.
                        </p>
                        <div
                            className="
                                outer-links mt-[20px] flex h-[35px] items-center
                                justify-around rounded-[8px] sm:mt-[20px]
                                sm:h-[55px] sm:rounded-[24px] md:mt-[40px] 
                                md:h-[70px] md:px-[20px] 
                                lg:mx-0 lg:mt-[70px] lg:h-[80px] lg:w-full lg:max-w-[580px] xl:h-[100px]
                            "
                        >
                            {outLinks.map((item, index) => (
                                <div
                                    key={index}
                                    className="relative w-[15px] cursor-pointer sm:w-[30px] md:w-[38px] lg:w-[42px] xl:w-auto"
                                    onClick={() => goNext(item)}
                                >
                                    <div className="absolute z-0 h-[120%] w-[120%] blur-md">
                                        <img alt="" src={`/img/home/link${index + 1}.png`} />
                                    </div>
                                    <img
                                        className="relative z-10 h-auto w-auto transition-all hover:scale-110 sm:h-full"
                                        alt=""
                                        src={`/img/home/link${index + 1}.png`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            </section>
        </>
    );
}
