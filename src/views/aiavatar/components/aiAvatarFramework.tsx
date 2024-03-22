import './index.less';

const AIAvatarFramework = () => {
    return (
        <div className="aiFramework mt-20 w-full overflow-hidden md:mt-14 md:min-h-screen">
            <div
                data-aos="fade-up"
                data-aos-anchor-placement="bottom-bottom"
                className="text-center font-inter-bold  text-3xl leading-tight text-white md:text-6xl"
            >
                3D AI Avatar Framework
            </div>
            <div data-aos="fade-zoom-in" className="relative mx-auto mt-[100px]">
                <div className="flex h-max items-center justify-center gap-x-1 md:gap-x-5">
                    <div className="relative flex h-full max-h-[515px] min-w-max flex-col overflow-hidden">
                        {new Array(5).fill('').map((_, idx) => {
                            return (
                                <div
                                    key={`top_arrow_${idx}`}
                                    className="animate-arrow absolute bottom-0 left-0 w-3 -translate-y-0 md:left-[2px] md:w-full"
                                >
                                    <img src="/img/aiavatar/svg/top-arrow.svg" alt="" />
                                </div>
                            );
                        })}

                        <div className="absolute left-[5px] top-[15px] z-[-1] h-[94%] max-h-[515px] w-[2px] bg-gradient-to-b from-[rgba(62,148,255,1)] to-[rgba(248,38,255,1)] md:left-[9px]"></div>

                        <div className="mt-2 flex max-h-[155px] items-center justify-start pb-[7.5vw]">
                            <img src="/img/aiavatar/svg/dot.svg" alt="" className="w-3 md:w-auto" />
                            <div className="px-2 font-inter-medium text-xs text-white md:px-7 md:text-2xl">
                                Application
                            </div>
                        </div>
                        <div className="flex max-h-[155px] items-center justify-start pb-[7.5vw]">
                            <img src="/img/aiavatar/svg/dot.svg" alt="" className="w-3 md:w-auto" />
                            <div className="px-2 font-inter-medium text-xs text-white md:px-7 md:text-2xl">
                                Service Layer
                            </div>
                        </div>
                        <div className="flex max-h-[155px] items-center justify-start pb-[7.5vw]">
                            <img src="/img/aiavatar/svg/dot.svg" alt="" className="w-3 md:w-auto" />
                            <div className="px-2 font-inter-medium text-xs text-white md:px-7 md:text-2xl">
                                Engine Layer
                            </div>
                        </div>
                        <div className="flex items-center justify-start">
                            <img src="/img/aiavatar/svg/dot.svg" alt="" className="w-3 md:w-auto" />
                            <div className="px-2 font-inter-medium text-xs text-white md:px-7 md:text-2xl">
                                Yuku
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-x-1 gap-y-4 md:gap-4">
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                3D Digital Assistant
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                3D Game NPC
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                3D Digital Companion
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                More
                            </div>
                        </div>

                        <div className="relative col-span-4 flex items-center justify-center">
                            <img
                                className="w-full"
                                src="/img/aiavatar/svg/big-block-bg.svg"
                                alt=""
                            />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                AI Agent Service
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Agent Engine
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                3D Engine
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Speech Engine
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Visual Engine
                            </div>
                        </div>

                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                AIGC
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Agent ID
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Agent Canister
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src="/img/aiavatar/svg/block-bg.svg" alt="" />
                            <div className="absolute flex h-full w-full items-center justify-center px-[60px] text-center font-inter-medium text-xs text-white opacity-70 md:text-xl">
                                Agent Database
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAvatarFramework;
