export default function HomeHighlights() {
    return (
        <div className="relative z-[1] mx-auto flex w-full max-w-[1360px] flex-col items-center px-[15px] md:px-[40px]">
            <div className="mt-[45px] flex md:mt-[70px]">
                <em className="highlights-text-1 font-[Inter-Bold] text-[24px] font-semibold not-italic leading-tight md:text-[42px]">
                    Yuku DAO
                </em>
                &nbsp; &nbsp;
                <p className="font-[Inter-Bold] text-[24px] font-semibold leading-tight text-white md:text-[42px]">
                    Highlights
                </p>
            </div>
            <div className="mt-[40px] grid w-full grid-cols-2 gap-[30px] md:mt-[60px] md:gap-[60px] lg:grid-cols-4 xl:gap-[150px]">
                <div className="flex flex-col">
                    <div className="flex h-[74px] w-[74px] items-center justify-center bg-[url('/img/home/sns/highlights-icon-bg.png')] bg-cover bg-center bg-no-repeat">
                        <img
                            className="w-[32px]"
                            src="/img/home/sns/highlights-icon-1.svg"
                            alt=""
                        />
                    </div>
                    <div className="mt-[12px] font-inter-semibold text-2xl text-white md:mt-[20px]">
                        NFT
                    </div>
                    <div className="mt-[5px] w-full font-inter-medium text-[12px] leading-[18px] text-white text-opacity-70 md:mt-[10px] md:text-[16px] md:leading-[24px]">
                        The most active NFT Marketplace on the Internet Computer
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex h-[74px] w-[74px] items-center justify-center bg-[url('/img/home/sns/highlights-icon-bg.png')] bg-cover bg-center bg-no-repeat">
                        <img
                            className="w-[38px]"
                            src="/img/home/sns/highlights-icon-2.svg"
                            alt=""
                        />
                    </div>
                    <div className="mt-[12px] font-inter-semibold text-2xl text-white md:mt-[20px]">
                        Metaverse
                    </div>
                    <div className="mt-[5px] w-full font-inter-medium text-[12px] leading-[18px] text-white text-opacity-70 md:mt-[10px] md:text-[16px] md:leading-[24px]">
                        The largest metaverse on the Internet Computer
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex h-[74px] w-[74px] items-center justify-center bg-[url('/img/home/sns/highlights-icon-bg.png')] bg-cover bg-center bg-no-repeat">
                        <img
                            className="w-[38px]"
                            src="/img/home/sns/highlights-icon-3.svg"
                            alt=""
                        />
                    </div>
                    <div className="mt-[12px] font-inter-semibold text-2xl text-white md:mt-[20px]">
                        AI
                    </div>
                    <div className="mt-[5px] w-full font-inter-medium text-[12px] leading-[18px] text-white text-opacity-70 md:mt-[10px] md:text-[16px] md:leading-[24px]">
                        AI avatars in your own metaverse space as your assistant
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex h-[74px] w-[74px] items-center justify-center bg-[url('/img/home/sns/highlights-icon-bg.png')] bg-cover bg-center bg-no-repeat">
                        <img
                            className="w-[40px]"
                            src="/img/home/sns/highlights-icon-4.svg"
                            alt=""
                        />
                    </div>
                    <div className="mt-[12px] font-inter-semibold text-2xl text-white md:mt-[20px]">
                        Cross-chain
                    </div>
                    <div className="mt-[5px] w-full font-inter-medium text-[12px] leading-[18px] text-white text-opacity-70 md:mt-[10px] md:text-[16px] md:leading-[24px]">
                        Yuku token will be bridged to Bitcoin and Ethereum ecosystems in 2024
                    </div>
                </div>
            </div>
        </div>
    );
}
