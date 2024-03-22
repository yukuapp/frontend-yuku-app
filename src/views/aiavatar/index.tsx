import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import AOS from 'aos';
import 'aos/dist/aos.css';
// import Rellax from 'rellax';
import message from '@/components/message';
import { cn } from '@/common/cn';
import AIAvatarFramework from './components/aiAvatarFramework';
import HowItWork from './components/howItWork';
import WhatAIAvatar from './components/whatAIAvatar';
import WhyAIAvatar from './components/whyAIAvatar';
import './index.less';

AOS.init();

const avatarList: (string | undefined)[] = [
    '/img/world/model-img1.png',
    '/img/world/model-img3.png',
    '/img/world/model-img2.png',
];

function AIAvatar() {
    const navigate = useNavigate();
    const currentIdx = useRef<number>(0);
    const [zoomAvatar, setZoomAvatar] = useState(currentIdx.current);
    const rellax = useRef<any>();

    // const lenis =

    useLenis(() => {});

    useEffect(() => {
        // console.log('lenis', lenis);

        const intervalId = setInterval(() => {
            setZoomAvatar((zoomAvatar) => (zoomAvatar + 1 === 3 ? 0 : zoomAvatar + 1));
        }, 5000);

        return () => {
            clearInterval(intervalId);
            rellax.current?.destroy();
        };
    }, []);

    return (
        <ReactLenis root>
            <div
                className="h-max bg-contain"
                style={{ backgroundImage: `url('/img/aiavatar/pageBg.png')` }}
            >
                <div
                    className="mx-auto mb-[10vh] w-screen overflow-hidden px-5 md:mb-0 md:px-[40px]"
                    // data-rellax-speed="-8"
                    // data-rellax-desktop-speed="-6"
                    // data-rellax-mobile-speed="0"
                >
                    <div className="mx-auto max-w-[1440px] items-center justify-center gap-x-2 md:flex md:min-h-screen">
                        <div data-aos="zoom-in-up" className="w-full md:w-1/2 md:min-w-[680px]">
                            <div className="pt-40 text-center font-inter-semibold text-4xl leading-tight md:pt-0 md:text-left md:text-7xl">
                                The First
                                <div className="mt-0 md:mt-4">
                                    Decentralized <span className="text-[#1391FF]">3D</span> <br />
                                </div>
                                <div className="mt-0 md:mt-4">
                                    <span className="textLiner">AI Avatar</span> System
                                </div>
                            </div>
                            <div className="mt-5 text-center font-inter-medium text-xs text-white opacity-75 md:mt-[40px] md:text-left md:text-xl">
                                In the future, AI Avatars will reshape our work and lifestyle,{' '}
                                <br />
                                becoming an indispensable part of our lives.
                            </div>

                            <div className="mt-5 flex w-full items-center justify-center md:mt-[65px] md:justify-start">
                                <div
                                    className="animateBtn mr-5 flex h-10 cursor-pointer items-center justify-between rounded-xl px-5 font-inter-semibold text-xs md:mr-10 md:h-[60px] md:text-xl"
                                    onClick={() => {
                                        // message.success('Coming soon');
                                        // return;
                                        navigate('/AIAvatar/home');
                                    }}
                                >
                                    Explore Our 3D AI Avatars
                                </div>
                                <div
                                    className="flex h-10 cursor-pointer items-center justify-between rounded-xl bg-[#148BF3] px-5 font-inter-semibold text-xs md:h-[60px] md:text-xl"
                                    onClick={() => {
                                        message.success('Coming soon');
                                        return;
                                    }}
                                >
                                    Create
                                </div>
                            </div>
                        </div>
                        <div data-aos="zoom-in-up" className="relative mt-10 h-full md:mt-0">
                            <div className="w-full rounded-full bg-center md:w-[100%]">
                                <img
                                    src={'/img/aiavatar/svg/banner-shadow-1.svg'}
                                    alt=""
                                    className="absolute left-0 top-0 z-0 md:scale-[130%]"
                                />
                                <img src={'/img/aiavatar/banner-1.png'} alt="" />
                            </div>
                            <div className="absolute left-[4%] top-0 flex h-full w-full items-center justify-center">
                                {avatarList.map((item, idx) => {
                                    return (
                                        <img
                                            key={item}
                                            alt=""
                                            className={cn(
                                                'absolute left-[-4%] top-[0%] h-[100%] transition-all duration-500 md:left-[-4%]',
                                                zoomAvatar === idx
                                                    ? 'scale-100 opacity-100'
                                                    : 'scale-0 opacity-0',
                                            )}
                                            src={item}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <WhatAIAvatar />
                    <WhyAIAvatar />

                    <HowItWork />
                    <AIAvatarFramework />
                </div>
            </div>
        </ReactLenis>
    );
}

export default AIAvatar;
