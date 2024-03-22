import { cn } from '@/common/cn';
import { useDeviceStore } from '@/stores/device';
import './index.less';

const list = new Array(16).fill({});
const xsList = new Array(6).fill({});

type WhyListType = {
    id: number;
    serial: string;
    text: string;
    title: string;
    position: string;
};

const whyList: WhyListType[] = [
    {
        id: 5,
        serial: '01',
        text: `The self-developed 3D avatar system enables users to quickly create high-quality avatars, 
        and supports changing avatars, skins, and clothes. Yuku avatar system also supports the integration 
        of avatars from third-party platforms.`,
        title: 'Decentralization',
        position: 'bottom-[-70%]',
    },
    {
        id: 12,
        serial: '02',
        text: `AI Avatar mimics the full range of human expressions, including text, voice, body movements, 
        and facial emotions. It has the capabilities of recognition, perception, and decision-making analysis 
        system, making its facial expressions, behaviors, and voice more realistic. With intelligent, 
        immersive, and humanized features, it brings warmth and meanning to the metaverse.`,
        title: 'Multimodal interaction',
        position: 'bottom-[-102%]',
    },
    {
        id: 8,
        serial: '03',
        text: `The system supports users uploading their own corpora for training, and also supports a variety 
        of workflows and tool plugins. It possesses memory and recollection abilities, and can autonomously 
        initiate goals, execute actions, and follow its own motivations.`,
        title: `The 'soul' of AI avatar`,
        position: 'bottom-[-75%]',
    },
    {
        id: 15,
        serial: '04',
        text: `The self-developed 3D avatar system enables users to quickly create high-quality avatars, 
        and supports changing avatars, skins, and clothes.  Yuku avatar system also supports the integration 
        of avatars from third-party platforms. Soon, it will support the generation of avatars from AIGC photos,
        meeting users' needs for a diverse selection of avatar styles, such as cute, cartoon, realistic, and more.`,
        title: '3D Avatar',
        position: 'bottom-[-102%]',
    },
    {
        id: 4,
        serial: '05',
        text: `3D AI Avatars use NFT technology for rights authentication to return data ownership 
        to the users and allow them to gain substantial benefits through data in the ecosystem. 
        Meanwhile, it also encourages more users to participate and promote ecosystem development.`,
        title: 'Data ownership',
        position: 'top-[-70%]',
    },
    {
        id: 1,
        serial: '06',
        text: `Each 3D AI Avatar has a decentralized on-chain identity, 
        facilitating interaction between humans and Avatars, as well as between Avatars in the metaverse.`,
        title: 'DID',
        position: 'top-[-45%]',
    },
];

const WhyAIAvatar = () => {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    return (
        <div className="whyAIAvatar mb-20 mt-20 w-full overflow-hidden md:mt-40 md:min-h-screen">
            <div
                data-aos="fade-up"
                data-aos-anchor-placement="bottom-bottom"
                className="text-center font-inter-bold text-3xl leading-tight text-white md:text-6xl"
            >
                Why 3D AI Avatar?
            </div>
            <div className="relative mt-[-5%] w-full">
                {isMobile && (
                    <div className="content">
                        {xsList.map((_, idx) => {
                            const content = whyList[idx];
                            return (
                                <div
                                    data-aos="fade-zoom-in"
                                    data-aos-anchor-placement="center-bottom"
                                    data-aos-delay="500"
                                    className="item"
                                    key={`${idx}_items_mobile`}
                                >
                                    <div className="hexagon">
                                        <div className={cn('absolute left-0 top-0 z-0')}>
                                            <img src={'/img/aiavatar/svg/bg.svg'} alt="" />
                                        </div>
                                        <div
                                            className={cn(
                                                'absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center',
                                                content ? 'group cursor-pointer' : 'hidden',
                                            )}
                                        >
                                            <div className="font-inter-bold text-2xl text-white">
                                                {content?.serial}
                                            </div>
                                            <div className="mt-2 text-center font-inter-semibold text-xl text-white">
                                                {content?.title}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!isMobile && (
                    <div
                        className={`
                            content translate-x-[-15%] scale-[70%] pb-60 pt-[150px] lg:translate-x-0 
                            lg:scale-[85%] lg:pt-[260px] xl:translate-x-0 xl:scale-100 xl:pt-[350px]
                        `}
                    >
                        {list.map((_, idx) => {
                            const content = whyList.find((s) => s.id === idx);
                            return (
                                <div className="item" key={`${idx}_items`}>
                                    <div className="hexagon relative">
                                        <div
                                            data-aos="fade-zoom-in"
                                            data-aos-anchor-placement="center-bottom"
                                            data-aos-delay="500"
                                            className={cn(
                                                'absolute left-0 top-0 z-0',
                                                [1, 4, 5, 6, 8, 9, 12, 15].includes(idx)
                                                    ? ''
                                                    : 'filterOpcity',
                                            )}
                                        >
                                            <img src={'/img/aiavatar/svg/bg.svg'} alt="" />
                                        </div>
                                        <div
                                            data-aos="fade-zoom-in"
                                            data-aos-anchor-placement="center-bottom"
                                            data-aos-delay="300"
                                            className={cn(
                                                'absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center',
                                                content ? 'group cursor-pointer' : 'hidden',
                                            )}
                                        >
                                            <div className="opacity-45 font-inter-bold text-4xl text-white transition-all duration-500 group-hover:opacity-100">
                                                {content?.serial}
                                            </div>
                                            <div className="opacity-45 mt-2 text-center font-inter-semibold text-2xl text-white transition-all duration-500 group-hover:opacity-100">
                                                {content?.title}
                                            </div>
                                            <div
                                                className={cn(
                                                    `absolute left-[5%] z-10 flex h-max w-[120%] flex-col items-center 
                                                    justify-center text-left font-inter-regular text-[16px] leading-[24px] text-white 
                                                    opacity-0 transition-all duration-500 group-hover:opacity-75`,
                                                    content ? content?.position : 'hidden',
                                                )}
                                            >
                                                {content?.text}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhyAIAvatar;
