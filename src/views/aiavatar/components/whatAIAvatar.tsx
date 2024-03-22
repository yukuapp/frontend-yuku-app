import { cn } from '@/common/cn';
import '../index.less';

type IconListItem = {
    id: number;
    icon: string | undefined;
    text: string;
    style: string;
};

type TagListItem = {
    id: number;
    logo: string | undefined;
    text: string;
};

const iconTextList: IconListItem[] = [
    {
        id: 1,
        icon: '/img/aiavatar/svg/behavior.svg',
        text: 'Behavior',
        style: 'absolute left-[5%] md:left-[20%] top-[5%] md:top-[15%] ',
    },
    {
        id: 2,
        icon: '/img/aiavatar/svg/cognition.svg',
        text: 'Cognition',
        style: 'absolute right-[5%] md:right-[20%] top-[5%] md:top-[15%] ',
    },
    {
        id: 3,
        icon: '/img/aiavatar/svg/perception.svg',
        text: 'Perception',
        style: 'absolute left-[5%] md:left-[15%] top-[32%] ',
    },
    {
        id: 4,
        icon: '/img/aiavatar/svg/multimodal.svg',
        text: 'Multimodal',
        style: 'absolute right-[5%] md:right-[15%] top-[35%] ',
    },
];

const bottomList: TagListItem[] = [
    { id: 1, text: '3D Digital Pet', logo: '/img/aiavatar/icon1.png' },
    { id: 2, text: '3D Digital Assistant', logo: '/img/aiavatar/icon2.png' },
    { id: 3, text: '3D Digital Companion', logo: '/img/aiavatar/icon3.png' },
    { id: 4, text: '3D Digital Teacher', logo: '/img/aiavatar/icon4.png' },
    { id: 5, text: '3D Virtual Host', logo: '/img/aiavatar/icon5.png' },
    { id: 6, text: '3D Game NPC', logo: '/img/aiavatar/icon6.png' },
];

const WhatAIAvatar = () => {
    return (
        <div className="mx-auto mt-20 w-full max-w-[1440px] md:mb-[40px] md:mt-0 md:min-h-screen">
            <div
                data-aos="fade-up"
                data-aos-anchor-placement="bottom-bottom"
                className="text-center font-inter-bold text-3xl leading-tight text-white md:text-6xl md:leading-tight"
            >
                What are 3D AI Avatars & <br />
                What can you do with them?
            </div>
            <div
                data-aos="fade-up"
                data-aos-anchor-placement="bottom-bottom"
                className="mx-auto mt-8 max-w-[900px] text-center font-inter-semibold text-xs leading-tight text-white opacity-75 md:mt-10 md:text-lg"
            >
                3D Al Avatar is an Al-powered virtual character that can perceive, make decisions,
                and take actions autonomously in a three-dimensional virtual world. They possess a
                certain level of intelligence and self-learning ability, enabling them to perform
                various tasks and interact with users.
            </div>
            <div className="relative mx-auto mt-[40px] md:max-w-[80%]">
                <div className="relative z-10">
                    <div
                        data-aos="fade-up"
                        data-aos-duration="300"
                        data-aos-anchor-placement="top-center"
                    >
                        <img src={'/img/aiavatar/avatar-bg.png'} alt="" />
                        <div className="blurRaduis absolute bottom-0 left-0 h-full w-full"></div>
                    </div>
                    <div>
                        {iconTextList.map((item, idx) => {
                            return (
                                <div
                                    data-aos="fade-down"
                                    data-aos-anchor-placement="top-center"
                                    data-aos-delay={100 * idx}
                                    className={cn(
                                        'flex h-5 w-max items-center justify-center md:h-10',
                                        item.style,
                                    )}
                                    key={item.id}
                                >
                                    <div>
                                        <img src={item.icon} />
                                    </div>
                                    <div className="ml-3 font-inter-medium text-xs leading-5 text-white md:text-xl">
                                        {item.text}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-0 left-0 z-10 grid w-full grid-cols-3 gap-3 md:bottom-[15%] md:gap-5">
                        {bottomList.map((item, idx) => {
                            return (
                                <div
                                    data-aos="fade-up"
                                    data-aos-anchor-placement="top-center"
                                    data-aos-delay={150 * idx}
                                    className="h-10 max-w-[300px] rounded-[40px] md:h-20"
                                    key={item.id}
                                >
                                    <div
                                        className={cn(
                                            `flex h-full w-full items-center justify-start rounded-[40px] bg-[#ffffff33] 
                                            shadow-[0px_5px_0px_0px_#22A2FF] backdrop-blur-md md:p-2`,
                                            idx < 3 ? 'md:translate-x-10' : '',
                                        )}
                                        key={item.id}
                                    >
                                        <div>
                                            <img src={item.logo} />
                                        </div>
                                        <div className="ml-3 font-inter-medium text-xs text-white md:text-lg">
                                            {item.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="roundAnimate absolute left-[50%] top-0 z-0 h-[40%] w-[40%] translate-x-[-50%]"></div>
            </div>
        </div>
    );
};

export default WhatAIAvatar;
