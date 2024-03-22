export default function MetaverseSecondBanner() {
    return (
        <>
            <section className="relative z-10 mx-auto flex min-h-[280px] w-full items-center justify-center overflow-hidden">
                <div className="banner-mask"></div>
                <img
                    className="mx-auto h-full min-h-[280px] w-full translate-x-[12%] object-cover"
                    src={'/img/metaverse/banner.png'}
                    alt=""
                />

                <div className="absolute z-20 w-full max-w-[1920px] px-[40px] text-center lg:bottom-[50%] lg:translate-y-[50%] lg:text-left xl:bottom-[50%]">
                    <div className="w-full max-w-none lg:w-[35vw] lg:max-w-[605px] xl:w-[40vw]">
                        <p
                            data-aos="fade-right"
                            data-aos-duration="600"
                            className="font-[Inter-Bold] text-[24px] leading-[30px] text-white md:text-[45px] md:leading-[60px] xl:text-[60px] xl:leading-[74px]"
                        >
                            Yuku, your gateway to Web3!
                        </p>
                        <p
                            data-aos="fade-right"
                            data-aos-duration="700"
                            className="mt-[20px] font-inter-medium text-[12px] leading-[24px] text-white md:mt-[35px] md:text-[16px] lg:mt-[50px]"
                        >
                            Yuku is a metaverse project with the goal of creating a network of
                            interconnected virtual spaces, platforms, and experiences that people
                            can effortlessly navigate. The ecosystem enables everyone to explore,
                            socialize, create, trade, and interact with various digital assets and
                            experiences.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
