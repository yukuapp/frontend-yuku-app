import { useEffect, useState } from 'react';
import RoadmapCanvas from './roadmapCanvas';

export default function HomeRoadmap() {
    const [a, setA] = useState(100);

    useEffect(() => {
        const interval = setInterval(() => {
            setA((prev) => (prev - 1 + 100) % 100);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="z-10 flex w-full flex-col overflow-hidden bg-[#101522]">
            <div className="relative z-[1] mx-auto mb-[170px] mt-[60px] flex w-full max-w-[1360px] flex-col items-center px-[40px] md:mt-[223px]">
                <div className="font-[Inter-Bold] text-[24px] font-semibold leading-tight text-white md:text-[42px]">
                    Roadmap
                </div>
                <div className="relative flex w-full items-center justify-center">
                    <RoadmapCanvas />
                    <img
                        className="relative z-[1] w-full"
                        src="/img/home/sns/roadmap-bg.png"
                        alt=""
                    />

                    <div className="absolute bottom-[-150px] left-0 z-[1] h-full w-full">
                        <div className="absolute bottom-[35%] left-[-5px] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2022
                                </div>
                                <div className="font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    NFT marketplace <br /> & aggregator
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-[17%] left-[15%] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2023
                                </div>
                                <div className="w-[157px] font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    Largest <br /> Metaverse on IC
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-[18%] left-[38%] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2024 (Q1)
                                </div>
                                <div className="w-[157px] font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    Yuku Token <br /> Launch on SNS
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-[27.4%] left-[62%] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2024 (Q2)
                                </div>
                                <div className="w-[157px] font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    AI Avatar & DEX
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-[42.2%] left-[82%] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2024 (Q3)
                                </div>
                                <div className="w-[157px] font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    Cross-chain <br /> & CEX
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-[72%] left-[98.7%] flex">
                            <img
                                className="h-[139px] w-[18px]"
                                src="/img/home/sns/roadmap-line.svg"
                                alt=""
                            />
                            <div className="ml-[15px] flex flex-col">
                                <div className="font-['Inter'] text-2xl font-semibold text-white">
                                    2024 (Q4)
                                </div>
                                <div className="w-[157px] font-['Inter'] text-lg font-medium text-white text-opacity-70">
                                    Building Yuku <br /> Ecosystem
                                </div>
                            </div>
                        </div>
                    </div>

                    <svg
                        className="absolute bottom-[-150px] left-0 h-full w-full"
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="434"
                        viewBox="0 0 1229 434"
                        fill="none"
                    >
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M1129.33 202.563C1025.41 274.5 846.35 346.7 626.614 397.731L626.447 397.769L626.279 397.8C336.505 450.304 173.139 437.759 84.5 402C39.9846 384.041 16.5701 359.665 4.50014 333C-5.49976 307 3.7661 274.77 13.085 251.5C4.89657 271.948 2.88594 306.474 13.0848 329.006C23.2771 351.524 45.7826 373.962 87.9606 390.978C172.692 425.161 334.799 437.384 624 385C842.827 334.165 1019.51 261.552 1121.36 191.052C1172.54 155.621 1203.44 121.356 1212.32 91.2384C1216.67 76.4921 1214.5 60 1211 48C1206 35 1197.64 12.5546 1178 0.970703C1199.11 13.4211 1213.83 27.7203 1221.88 43.7846C1230.01 60.0119 1231 77.4061 1225.75 95.1996C1215.44 130.162 1181.04 166.766 1129.33 202.563Z"
                            fill="url(#paint0_linear_765_13733)"
                        />
                        <defs>
                            <linearGradient
                                id="paint0_linear_765_13733"
                                x1="1222"
                                y1="22.0008"
                                x2="-19.9999"
                                y2="305"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stop-color="#0A60E2" stop-opacity="0.46" />
                                <stop offset={`${a}%`} stop-color="#40A6FA" />
                                <stop offset="1" stop-color="#44ABFC" stop-opacity="0.42" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
            <div className="border-bg-bottom flex h-[10px] w-full flex-shrink-0">
                <span></span>
            </div>
        </div>
    );
}
