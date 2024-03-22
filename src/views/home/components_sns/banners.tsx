import TopBannerThreeJS from './topBannerThreejs';

export default function HomeBanners() {
    return (
        <div className="home-page flex h-screen flex-col">
            <div className="relative flex w-full flex-1 flex-shrink-0 justify-center overflow-hidden">
                <div className="h-full w-full object-cover">
                    <TopBannerThreeJS />
                </div>
                <div className="absolute top-0 mx-auto flex h-full w-full">
                    <div className="items-between mx-auto flex w-full max-w-[1400px] px-[40px]">
                        <div className="relative z-[1] flex flex-1 flex-col justify-center md:flex-row md:justify-between">
                            <div className="flex w-full flex-col items-center justify-center md:h-full">
                                <span data-aos="fade-up" data-aos-duration="600" className="flex">
                                    <p className="text-edge-cap bg-gradient-to-r from-[#FFF] to-[#A7ADC2] bg-clip-text text-center font-inter-bold text-[48px] text-transparent md:text-[112px]">
                                        Yuku DAO
                                    </p>
                                </span>
                                <span
                                    data-aos="fade-up"
                                    data-aos-duration="600"
                                    className="font-animation mt-3 font-inter-medium text-4xl text-white md:text-[82px]"
                                >
                                    Your Gateway To
                                </span>
                                <span
                                    data-aos="fade-up"
                                    data-aos-duration="600"
                                    className="font-animation mt-3 flex"
                                >
                                    <p className="text-edge-cap font-inter-bold text-[48px] tracking-[3.28px] text-white md:text-[86px]">
                                        Web3
                                    </p>
                                </span>

                                <div
                                    data-aos="fade-up"
                                    data-aos-duration="600"
                                    className="mt-10 flex items-center justify-center gap-x-10 md:mt-14 md:gap-x-20"
                                >
                                    <div className="flex cursor-pointer items-center justify-center rounded-xl bg-[#3378FF] px-4 py-2 font-inter-medium text-base transition-all duration-300 hover:bg-[rgba(51,120,255,0.85)] md:w-[210px] md:px-8 md:py-3 md:text-lg">
                                        Yuku Public Sale
                                    </div>
                                    <div
                                        className="flex flex-shrink-0 translate-x-0 cursor-pointer items-center justify-center rounded-xl border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.3)] 
                                        px-4 py-2 font-inter-medium text-base backdrop-blur-[3px] transition-all duration-300 hover:border-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.9)] 
                                        hover:text-[#333] hover:backdrop-blur-[1px] md:w-[210px] md:px-8 md:py-3 md:text-lg"
                                    >
                                        Tutorial
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div
                            data-aos="fade-up"
                            data-aos-duration="600"
                            className="mt-[20px] flex justify-center gap-[10px] md:gap-[65px]"
                        >
                            <div
                                className="
                                    group flex flex-shrink-0 translate-x-0 items-center rounded-2xl border border-transparent px-3 py-3 
                                    transition-all duration-300 hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.24)] 
                                    hover:backdrop-blur-[3px] xl:translate-x-[-5vw]"
                            >
                                <p className="mr-2 font-inter-medium text-[20px] text-white">
                                    What is SNS
                                </p>
                                <img
                                    className="group-hover:hidden group-hover:opacity-0"
                                    src="/img/home/sns/dot.svg"
                                    alt=""
                                />{' '}
                                <img
                                    className="hidden group-hover:block group-hover:opacity-100"
                                    src="/img/home/sns/hover-dot.svg"
                                    alt=""
                                />
                            </div>
                            <div
                                className="
                                    group flex flex-shrink-0 translate-x-0 items-center rounded-2xl border border-transparent px-3 py-3 
                                    transition-all duration-300 hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.24)] 
                                    hover:backdrop-blur-[3px] xl:translate-x-0"
                            >
                                <p className="mr-2 font-inter-medium text-[20px] text-white">
                                    SNS Participation
                                </p>
                                <img
                                    className="group-hover:hidden group-hover:opacity-0"
                                    src="/img/home/sns/dot.svg"
                                    alt=""
                                />{' '}
                                <img
                                    className="hidden group-hover:block group-hover:opacity-100"
                                    src="/img/home/sns/hover-dot.svg"
                                    alt=""
                                />
                            </div>
                            <div
                                className="
                                    group flex flex-shrink-0 translate-x-0 items-center rounded-2xl border border-transparent px-3 py-3 
                                    transition-all duration-300 hover:border-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.24)] 
                                    hover:backdrop-blur-[3px] xl:translate-x-[-5vw]"
                            >
                                <p className="mr-2 font-inter-medium text-[20px] text-white">
                                    How to buy ICP
                                </p>
                                <img
                                    className="group-hover:hidden group-hover:opacity-0"
                                    src="/img/home/sns/dot.svg"
                                    alt=""
                                />{' '}
                                <img
                                    className="hidden group-hover:block group-hover:opacity-100"
                                    src="/img/home/sns/hover-dot.svg"
                                    alt=""
                                />
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
