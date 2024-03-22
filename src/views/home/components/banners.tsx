import { useRef } from 'react';

export default function HomeBanners() {
    const videoRef = useRef(null);

    return (
        <section className="relative z-10 mx-auto flex min-h-[250px] items-center justify-center xl:h-screen">
            <video
                className="h-full min-h-[250px] w-full object-cover"
                ref={videoRef}
                autoPlay
                preload="auto"
                muted
                loop
                id="bg"
                playsInline={true}
            >
                <source
                    src="https://bafybeiasn3lw2w5iqrz6zf6embael65ed36yqiu5flljx4zlfuywhdudey.ipfs.w3s.link/yuku-home-banner.mp4"
                    type="video/mp4"
                />
            </video>
            <div className="absolute text-center">
                <p
                    data-aos="fade-up"
                    data-aos-duration="600"
                    className="font-animation font-[Inter-Bold] text-[32px] font-bold leading-[110%] text-white md:text-[64px] xl:text-[82px]"
                >
                    Imagine
                    <br />
                    Create & Own
                </p>
                <p
                    data-aos="fade-up"
                    data-aos-duration="1000"
                    className="mt-[20px] font-inter text-[12px] leading-[140%] text-white md:text-[18px]"
                >
                    Unlock Limitless Potential: Yuku, Your Gateway to NFTs,
                    <br />
                    Metaverse, and GameFi!
                </p>
            </div>
        </section>
    );
}
