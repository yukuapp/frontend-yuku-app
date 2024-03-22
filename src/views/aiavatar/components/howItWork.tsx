import './index.less';

type ListType = {
    id: number;
    title: string;
    desc: string;
    icon: string | undefined;
};

const list: ListType[] = [
    {
        id: 1,
        title: 'Step 1',
        desc: 'Fill in the basic information and select 3D image, voice and scene',
        icon: '/img/aiavatar/one-icon.png',
    },
    {
        id: 2,
        title: 'Step 2',
        desc: 'Upload documents (word, pdf, txt, etc.) to the knowledge base',
        icon: '/img/aiavatar/two-icon.png',
    },
    {
        id: 3,
        title: 'Step 3',
        desc: 'Test your own 3D AI Avatar',
        icon: '/img/aiavatar/three-icon.png',
    },
    {
        id: 4,
        title: 'Step 4',
        desc: 'Publish own 3D AI Avatar and share',
        icon: '/img/aiavatar/four-icon.png',
    },
];

export const ItemCard = ({ item }: { item: ListType }) => {
    return (
        <div className="group relative flex min-h-[357px] min-w-[270px] max-w-[330px] items-center justify-center rounded-3xl transition-all duration-300 md:hover:scale-105">
            <div className="h-max w-full rounded-3xl">
                <img
                    className="left-0 top-0 w-full opacity-100 transition-all duration-300 group-hover:opacity-0"
                    src="/img/aiavatar/svg/border.svg"
                    alt=""
                />
                <img
                    className="absolute left-0 top-0 w-full opacity-0 transition-all duration-300 group-hover:opacity-100"
                    src="/img/aiavatar/svg/hover-border.svg"
                    alt=""
                />
            </div>
            <div
                className={`absolute z-0 h-full w-full cursor-pointer rounded-3xl p-[11px] transition-all duration-300 group-hover:border-transparent 
                `}
            >
                <div className="flex h-full w-full flex-col justify-between rounded-3xl bg-[rgba(255,255,255,0.15)] p-5">
                    <div className="relative flex h-16 w-16 items-center justify-center">
                        <img src={'/img/aiavatar/svg/icon-bg.svg'} alt="" />
                        <img src={item.icon} className="absolute left-auto top-auto" />
                    </div>
                    <div>
                        <div className="text-center font-inter-medium text-2xl text-white">
                            {item.title}
                        </div>
                        <div className="opacity-65 mt-3 text-center font-inter-medium text-base text-white">
                            {item.desc}
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="flex items-center justify-center rounded-xl border border-[rgba(255,255,255,0.65)] px-5 py-2">
                            <img src={'/img/aiavatar/svg/right.svg'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HowItWork = () => {
    return (
        <div className="mx-auto mt-20 w-full max-w-[1440px] md:mt-0 md:min-h-screen">
            <div
                data-aos="fade-up"
                data-aos-anchor-placement="bottom-bottom"
                className="text-center font-inter-bold text-3xl leading-tight text-white md:text-6xl"
            >
                How it works?
            </div>
            <div className="mx-auto mt-[30px] w-full md:mt-[150px] ">
                <div
                    className="
                        flex w-full gap-x-[15px]
                        gap-y-[15px] overflow-x-scroll md:mt-[50px] md:grid
                        md:grid-cols-2 md:gap-x-[30px] md:gap-y-[30px] lg:grid-cols-3 xl:grid-cols-4
                    "
                >
                    {list.map((item, index) => {
                        return (
                            <div
                                data-aos="zoom-in-up"
                                data-aos-anchor-placement="center-bottom"
                                data-aos-delay={100 * index}
                                key={item.id}
                            >
                                <ItemCard item={item} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HowItWork;
