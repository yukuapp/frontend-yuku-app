export default function HomeInvestors() {
    return (
        <div className="relative z-[1] mx-auto flex w-full max-w-[1360px] flex-col items-center px-[64px] pt-[80px] lg:pt-[180px] xl:px-[40px]">
            <div className="font-[Inter-Bold] text-[24px] font-semibold leading-tight text-white md:text-[42px]">
                Strategic Investors
            </div>
            <div className="mt-[66px] grid w-full grid-cols-1 gap-[30px] md:grid-cols-2 xl:grid-cols-5">
                <div className="mx-auto flex h-[294px] w-[230px] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-[2px] border-white md:h-[275px] md:w-full md:max-w-none">
                    <div className="flex flex-1 items-center justify-center">
                        <img
                            className="w-[170px] md:w-[170px]"
                            src="/img/home/sns/strategic-1.svg"
                            alt=""
                        />
                    </div>
                    <div className="flex h-[132px] w-full items-center justify-center bg-white px-5 text-center text-[14px] font-semibold leading-[24px] text-[#333] md:h-[124px] md:text-[20px]">
                        Swiss Blockchain Labs
                    </div>
                </div>
                <div className="mx-auto flex h-[294px] w-[230px] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-[2px] border-white md:h-[275px] md:w-full md:max-w-none">
                    <div className="flex flex-1 items-center justify-center">
                        <img
                            className="w-[125px] md:w-[148px]"
                            src="/img/home/sns/strategic-2.svg"
                            alt=""
                        />
                    </div>
                    <div className="flex h-[132px] w-full items-center justify-center bg-white text-center text-[14px] font-semibold leading-[24px] text-[#333] md:h-[124px] md:text-[20px]">
                        ICP Global Fund
                    </div>
                </div>
                <div className="mx-auto flex h-[294px] w-[230px] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-[2px] border-white md:h-[275px] md:w-full md:max-w-none">
                    <div className="flex flex-1 items-center justify-center">
                        <img
                            className="w-[70px] md:w-[90px]"
                            src="/img/home/sns/strategic-3.png"
                            alt=""
                        />
                    </div>
                    <div className="flex h-[132px] w-full items-center justify-center bg-white text-center text-[14px] font-semibold leading-[24px] text-[#333] md:h-[124px] md:text-[20px]">
                        Archery
                    </div>
                </div>
                <div className="mx-auto flex h-[294px] w-[230px] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-[2px] border-white md:h-[275px] md:w-full md:max-w-none">
                    <div className="flex flex-1 items-center justify-center">
                        <img
                            className="w-[161px] md:w-[170px]"
                            src="/img/home/sns/strategic-4.svg"
                            alt=""
                        />
                    </div>
                    <div className="flex h-[132px] w-full items-center justify-center bg-white text-center text-[14px] font-semibold leading-[24px] text-[#333] md:h-[124px] md:text-[20px]">
                        Bochsler Finance
                    </div>
                </div>
                <div className="mx-auto flex h-[294px] w-[230px] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-3xl border-[2px] border-white md:h-[275px] md:w-full md:max-w-none">
                    <div className="flex flex-1 items-center justify-center">
                        {/* <img
                            className="w-[110px] md:w-[100px]"
                            src="/img/home/sns/strategic-5.svg"
                            alt=""
                        /> */}
                    </div>
                    <div className="flex h-[132px] w-full items-center justify-center bg-white text-center text-[14px] font-semibold leading-[24px] text-[#333] md:h-[124px] md:text-[20px]">
                        {/* Dfinity */}
                    </div>
                </div>
            </div>
        </div>
    );
}
