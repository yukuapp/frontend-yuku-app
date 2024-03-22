import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as echarts from 'echarts';

export default function HomeDistribution() {
    const distributionEcharts = useRef(null);

    useEffect(() => {
        const myChart = echarts.init(distributionEcharts.current, {
            renderer: 'canvas',
            useDirtyRect: false,
        });
        const option: echarts.EChartsOption = {
            tooltip: {
                show: false,
            },
            toolbox: {
                show: false,
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    restore: { show: true },
                    saveAsImage: { show: true },
                },
            },
            series: {
                name: 'Token Distribution',
                type: 'pie',
                color: [
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#B9391E',
                        },
                        {
                            offset: 1,
                            color: '#E3502B',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#FFE601',
                        },
                        {
                            offset: 1,
                            color: '#BFA106',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#828C99',
                        },
                        {
                            offset: 1,
                            color: '#C5D2E0',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#DE810E',
                        },
                        {
                            offset: 1,
                            color: '#FFC530',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#4EE280',
                        },
                        {
                            offset: 1,
                            color: '#209B4A',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#2EEBEB',
                        },
                        {
                            offset: 1,
                            color: '#1A8E8E',
                        },
                    ]),
                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#4318AD',
                        },
                        {
                            offset: 1,
                            color: '#9B33F3',
                        },
                    ]),

                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#E43EFF',
                        },
                        {
                            offset: 1,
                            color: '#8B129E',
                        },
                    ]),

                    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: '#4BA6FA',
                        },
                        {
                            offset: 1,
                            color: '#3066BA',
                        },
                    ]),
                ],
                selectedMode: 'single',
                roseType: 'radius',
                label: {
                    show: false,
                    formatter: '{b|{b}}',
                    rich: {
                        b: {
                            fontSize: 18,
                            fontWeight: 'bold',
                            lineHeight: 33,
                        },
                    },
                    position: 'outside',
                },
                labelLine: {
                    lineStyle: {
                        type: 'dotted',
                        width: 2,
                    },
                },
                emphasis: {
                    label: {
                        show: true,
                        // @ts-ignore
                        color: [],
                    },
                },
                data: [
                    // { value: 10, name: 'Liquidity' },
                    // { value: 16, name: 'Staking Reward' },
                    // { value: 5, name: 'Advisors' },
                    // { value: 17, name: 'SNS' },
                    // { value: 9, name: 'Team' },
                    // { value: 20, name: 'Ecosystem Fund' },
                    // { value: 8, name: 'Seed Funders' },
                    // { value: 10, name: 'Cross-Chain' },
                    // { value: 5, name: 'Airdrop' },
                    { value: 9.5, name: 'SNS' },
                    { value: 10, name: 'Seed Funders' },
                    { value: 9, name: 'Team' },
                    { value: 10, name: 'Staking Reward' },
                    { value: 9, name: 'Liquidity' },
                    { value: 10, name: 'Airdrop' },
                    { value: 9, name: 'Advisors' },
                    { value: 10, name: 'Ecosystem Fund' },
                    { value: 9, name: 'Cross-Chain' },
                ],
                itemStyle: {
                    borderRadius: 1,
                },
            },
        };

        myChart.setOption(option);
    }, []);

    return (
        <>
            <div className="relative z-[2] mx-auto mt-[90px] flex w-full flex-col items-center overflow-hidden rounded-t-[60px] md:mt-[175px] md:rounded-t-[120px]">
                <div className="relative flex w-full flex-col items-center justify-center">
                    <div className="distribution_bg absolute bottom-0 left-0 h-full w-full" />
                    <img
                        className="max-h-[900px] min-h-[300px] w-full object-cover"
                        src="/img/home/sns/distribution.png"
                        alt=""
                    />
                    <div className="absolute top-0 z-[2] flex h-[300px] w-[850px] max-w-full flex-col items-center md:h-[750px]">
                        <div className="mt-[30px] flex md:mt-[70px]">
                            <p className="font-[Inter-Bold] text-[24px] font-semibold leading-tight text-white md:text-[42px]">
                                Yuku DAO Token Distribution
                            </p>
                        </div>
                        <div className="relative flex h-full w-full">
                            <div ref={distributionEcharts} className="h-full w-full"></div>
                            <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
                                <p className="absolute left-[42%] top-[25%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    10%
                                </p>
                                <p className="absolute left-[52%] top-[27%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    17%
                                </p>
                                <p className="absolute left-[63%] top-[35%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    8%
                                </p>
                                <p className="absolute left-[63%] top-[51%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    9%
                                </p>
                                <p className="absolute left-[59%] top-[68%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    16%
                                </p>
                                <p className="absolute left-[47%] top-[68%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    10%
                                </p>
                                <p className="absolute left-[37%] top-[68%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    5%
                                </p>
                                <p className="absolute left-[34%] top-[50%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    5%
                                </p>
                                <p className="absolute left-[33%] top-[32%] h-full w-full text-[12px] font-bold md:text-[24px]">
                                    20%
                                </p>
                            </div>
                        </div>
                        <div
                            className="absolute left-[-201px] top-[150px] hidden w-[300px] xl:block"
                            data-aos="fade-up"
                            data-aos-duration="600"
                        >
                            <div className="font-['Inter'] text-2xl font-semibold text-white">
                                SNS Swap
                            </div>
                            <div className="mt-[24px] w-full font-['Inter'] text-lg font-medium leading-7 text-white text-opacity-70">
                                170 million Yuku tokens are released 100% at Token Genesis Event in
                                April 2024 with dissolve delays of 0, 3 and 6 months
                            </div>
                        </div>
                        <div
                            className="absolute right-[-264px] top-[190px] hidden w-[344px] xl:block"
                            data-aos="fade-up"
                            data-aos-duration="600"
                        >
                            <div className="font-['Inter'] text-2xl font-semibold text-white">
                                Seed funders
                            </div>
                            <div className="mt-[24px] w-full font-['Inter'] text-lg font-medium leading-7 text-white text-opacity-70">
                                80 million Yuku tokens are released at months 3, 6, 9, …, 24 in 8
                                installments
                            </div>
                        </div>
                        <div
                            className="absolute bottom-[120px] left-[-250px] hidden w-[344px] xl:block"
                            data-aos="fade-up"
                            data-aos-duration="600"
                        >
                            <div className="font-['Inter'] text-2xl font-semibold text-white">
                                Team
                            </div>
                            <div className="mt-[24px] w-full font-['Inter'] text-lg font-medium leading-7 text-white text-opacity-70">
                                90 million Yuku tokens are released at months 0, 3, 6, 9, …, 24 with
                                a dissolve delay of 3 months in 9 installments
                            </div>
                        </div>
                        <div
                            className="absolute bottom-[100px] right-[-304px] hidden w-[344px] xl:block"
                            data-aos="fade-up"
                            data-aos-duration="600"
                        >
                            <div className="font-['Inter'] text-2xl font-semibold text-white">
                                Treasury
                            </div>
                            <div className="mt-[24px] w-full font-['Inter'] text-lg font-medium leading-7 text-white text-opacity-70">
                                660 million Yuku tokens are managed by Yuku DAO for staking rewards,
                                airdrop, liquidity, market making, cross-chain technology and
                                ecosystem growth.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center bg-[#101522] pt-20 xl:pt-10">
                <Link
                    to="/whitepaper"
                    target="_blank"
                    className="distribution_btn_bg mt-[7px]  flex h-auto w-auto cursor-pointer items-center justify-center px-[16px] py-[8px] font-['Inter-medium'] text-[12px] font-medium text-white md:h-[62px] md:w-[325px] md:p-0 md:text-xl"
                >
                    Yuku Whitepaper V1.0
                </Link>
                <div className="mt-[30px] flex w-full flex-col xl:hidden">
                    <div className="mx-[16px] flex md:mx-[40px]">
                        <div className="mr-[40px] flex flex-1 flex-col">
                            <div className="font-['Inter'] text-lg font-semibold text-white">
                                SNS Swap
                            </div>
                            <div className="w-full font-['Inter'] text-xs font-medium text-white text-opacity-70">
                                80 million Yuku tokens are released at months 3, 6, 9, …, 24 in 8
                                installments
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="font-['Inter'] text-lg font-semibold text-white">
                                Seed funders
                            </div>
                            <div className="w-full font-['Inter'] text-xs font-medium text-white text-opacity-70">
                                170 million Yuku tokens are released 100% at Token Genesis Event in
                                April 2024 with dissolve delays of 0, 3 and 6 months
                            </div>
                        </div>
                    </div>
                    <div className="mx-[16px] mt-[30px] flex md:mx-[40px]">
                        <div className="mr-[40px] flex flex-1 flex-col">
                            <div className="font-['Inter'] text-lg font-semibold text-white">
                                Team
                            </div>
                            <div className="w-full font-['Inter'] text-xs font-medium text-white text-opacity-70">
                                90 million Yuku tokens are released at months 0, 3, 6, 9, …, 24 with
                                a dissolve delay of 3 months in 9 installments
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col">
                            <div className="font-['Inter'] text-lg font-semibold text-white">
                                Treasury
                            </div>
                            <div className="w-full font-['Inter'] text-xs font-medium text-white text-opacity-70">
                                Staking Reward: 160 million Liquidity: 100 million Airdrop: 50
                                million Advisors: 50 million Ecosystem Fund: 200 million
                                Cross-chain: 100 million
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
