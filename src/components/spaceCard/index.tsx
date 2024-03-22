import { useNavigate } from 'react-router-dom';
import message from '@/components/message';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import AspectRatio from '../ui/aspect-ratio';

// space card type
export type SpaceInfo = {
    title: string;
    creator: string;
    time: string;
    cover?: string;
    [propName: string]: any;
};

const SpaceCard = ({
    info,
    cover,
    index,
}: {
    info: SpaceInfo;
    cover: string | undefined;
    index: number;
}) => {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    const navigate = useNavigate();
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const token = connectedIdentity && getYukuToken();
    const onClickCard = () => {
        if (isMobile) {
            message.warning('Mobile Support Coming Soon...');
            return;
        }
        if (!connectedIdentity) {
            message.warning('Please log in, you can enter the space after logging in!');
            navigate('/connect');
            return;
        }

        if (!token) {
            message.warning('Please wait while still connecting your wallet.');
            return;
        }

        info.id && info.link && window.open(info.link, '_blank');
    };

    return (
        <div
            // lg:min-w-[330px]
            className="group w-full min-w-[280px] cursor-pointer"
            data-aos="flip-up"
            data-aos-anchor-placement="center-bottom"
            data-aos-delay={100 * index}
        >
            <AspectRatio ratio={407 / 256} className="overflow-hidden rounded-[16px]">
                <div
                    className="relative flex h-full w-full flex-col justify-between overflow-hidden p-2 md:p-5 md:pt-4"
                    onClick={() => onClickCard()}
                >
                    <img
                        src={cover || '/img/space/space-card.png'}
                        className="absolute bottom-0 left-0 right-0 top-0 h-full w-full duration-200 group-hover:scale-[1.05]"
                        alt=""
                    />
                    {/* <div className="flex h-[20px] w-[80px] items-center justify-center gap-x-2 rounded-md bg-white bg-opacity-25 backdrop-blur-[20px] md:h-[28px] md:w-[88px]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00EF0A]" />
                        <div className="font-inter-semibold text-[12px] leading-tight text-white md:text-sm">
                            5 online
                        </div>
                    </div> */}
                    <div className="absolute bottom-0 left-0 right-0 flex w-full flex-col gap-y-[8px] rounded-b-[16px] bg-gradient-to-b from-[#0A0D1600] to-[#000000]/80 p-3 md:p-5 2xl:gap-y-[10px]">
                        <div className="font-inter-semibold text-[14px] leading-[20px] text-white md:text-[14px] 2xl:text-xl">
                            {info.title}
                        </div>
                        {/* <div className="flex w-full justify-between font-inter-medium text-[12px] leading-none text-white text-opacity-70 md:text-[14px] 2xl:text-sm">
                            <div>By: Jinghui Liu {info.creator}</div>
                            <div>DEC 08,2023 {info.time}</div>
                        </div> */}
                    </div>
                </div>
            </AspectRatio>
        </div>
    );
};

export default SpaceCard;
