import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import YukuIcon from '@/components/ui/yuku-icon';
import { useIdentityStore } from '../../../stores/identity';

type TextLink = { text: string; link: string };
type TextArray = Array<TextLink>;

const marketplaceArr: TextArray = [
    { text: 'Collectibles', link: '/marketplace/explore' },
    { text: 'OAT', link: '/marketplace/explore/oat' },
    { text: 'Art', link: '/marketplace/explore/art' },
    { text: 'Launchpad', link: '/marketplace/launchpad' },
];

const myAccountArr = [
    {
        text: 'Profile',
        link: '',
    },
    {
        text: 'Favorites',
        link: '/favorite',
    },
    {
        text: 'Activity',
        link: '/activity',
    },
    {
        text: 'Bid Records',
        link: '/auction',
    },
];

const joinTheCommunityArr = [
    { text: 'twitter', link: 'https://twitter.com/yukuapp', size: isMobile ? 10 : 15 },
    { text: 'telegram', link: 'https://t.me/YukuApp', size: isMobile ? 10 : 15 },
    { text: 'medium', link: 'https://medium.com/@yukuApp', size: isMobile ? 10 : 15 },
    { text: 'youtube', link: 'https://www.youtube.com/@YukuApp', size: isMobile ? 10 : 15 },
];

const myAboutArr = [
    { text: 'Contact@yuku.app', link: '', type: 'mailto' },
    { text: 'Whitepaper', link: '/whitepaper', target: '_blank' },
];

export default function Footer() {
    const location = useLocation();
    const identity = useIdentityStore((s) => s.connectedIdentity);
    return (
        <div
            className={`z-0 mt-[30px] border-t border-[#283047] px-[19px] pb-10 md:mt-[78px] md:px-[119px] ${
                (location && location.pathname === '/kyc/register') ||
                (location && location.pathname === '/marketplace/activity') ||
                (location && location.pathname.indexOf('/info/even') !== -1)
                    ? 'hidden'
                    : '' || (location && location.pathname.indexOf('/AIAvatar/') !== -1)
                    ? 'hidden'
                    : ''
            } ${location && location.pathname === '/' && '!mt-0 border-t-0 bg-[#101522]'}`}
        >
            <div
                className={`mx-auto mt-[30px] flex w-full  max-w-[1920px] flex-col flex-wrap justify-between gap-y-[25px] md:mt-[56px] md:flex-row ${
                    ['/origyn', '/origyn/launchpad', '/origyn/market'].includes(
                        location.pathname,
                    ) && '!mt-0'
                }`}
            >
                <div className="justify-left mb-3 mt-3 flex flex-row items-start md:mb-0 md:mt-0 md:flex-col">
                    <div className="w-fit font-inter-medium text-[14px] md:mt-0">
                        <img
                            src="/img/logo/yuku.svg"
                            className="h-[40px] flex-shrink-0  cursor-pointer bg-cover bg-center bg-no-repeat md:h-[45px] lg:h-[50px]"
                            alt="shiku logo"
                        />
                    </div>
                </div>
                <div className="flex-col gap-x-[10px] md:flex">
                    <div className="mb-[20px] grid grid-cols-4 justify-between gap-x-[10px] font-inter-medium text-[12px]  text-[#E5F0FF] md:gap-x-[20px] md:text-[20px] xl:gap-x-[80px] 2xl:gap-x-[128px] ">
                        <div>Marketplace</div>
                        <div>My Account</div>
                        <div>Community</div>
                        <div>About</div>
                    </div>
                    <div className="grid grid-cols-4 gap-x-[10px] text-[14px]  leading-[16px] text-[#ADBACC] md:gap-x-[20px] md:text-[16px] xl:gap-x-[80px] 2xl:gap-x-[128px] ">
                        <div className="flex flex-col gap-y-[15px] md:gap-y-[25px]">
                            {marketplaceArr.map((item) => (
                                <Link
                                    className="group relative flex origin-left scale-75 cursor-pointer items-center whitespace-nowrap font-inter-medium text-[14px] duration-300 hover:text-[#0a8aff] md:scale-100 md:text-[16px]"
                                    key={item.text}
                                    to={item.link}
                                    target={item.link.startsWith('https://') ? '_blank' : '_self'}
                                >
                                    <i className="absolute -left-[16px] hidden group-hover:flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M4 2L8 6L4 10"
                                                stroke="#3366FF"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </i>
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-col gap-y-[15px] md:gap-y-[25px]">
                            {myAccountArr.map((item) => (
                                <Link
                                    className="group relative flex origin-left scale-75 cursor-pointer items-center whitespace-nowrap font-inter-medium text-[14px] duration-300 hover:text-[#0a8aff] md:scale-100 md:text-[16px]"
                                    key={item.text}
                                    to={
                                        identity && identity?.principal
                                            ? `/profile/${identity?.principal}${item.link}`
                                            : '/connect'
                                    }
                                    target={item.link.startsWith('https://') ? '_blank' : '_self'}
                                >
                                    <i className="absolute -left-[16px] hidden group-hover:flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M4 2L8 6L4 10"
                                                stroke="#3366FF"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </i>
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                        <div className="flex w-full flex-col items-start gap-y-[15px] md:gap-y-[25px]">
                            {joinTheCommunityArr.map((item) => (
                                <Link
                                    className="group relative mr-auto flex w-full cursor-pointer items-center whitespace-nowrap font-inter-medium text-[14px] duration-300 hover:text-[#0a8aff] md:scale-100 md:text-[16px]"
                                    key={item.text}
                                    to={item.link}
                                    target={item.link.startsWith('https://') ? '_blank' : '_self'}
                                >
                                    <YukuIcon
                                        name={`media-${item.text}`}
                                        size={item.size}
                                        color="white"
                                        className="cursor-pointer transition-opacity hover:opacity-50"
                                    />

                                    <div className="ml-[15px] mr-auto font-inter-medium text-[12px] capitalize  text-white/60 group-hover:text-white md:text-[16px]">
                                        {item.text === 'twitter' ? 'X' : item.text}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="flex w-full flex-col items-start gap-y-[15px] md:gap-y-[25px]">
                            {myAboutArr.map((item) => (
                                <Link
                                    className="group relative flex origin-left scale-75 cursor-pointer items-center whitespace-nowrap font-inter-medium text-[14px] duration-300 hover:text-[#0a8aff] md:scale-100 md:text-[16px]"
                                    key={item.text}
                                    to={
                                        item.type === 'mailto'
                                            ? 'mailto:' + item.text
                                            : item.link
                                            ? item.link
                                            : ''
                                    }
                                    target={
                                        item.target
                                            ? item.target
                                            : item.link && item.link.startsWith('https://')
                                            ? '_blank'
                                            : '_self'
                                    }
                                >
                                    <i className="absolute -left-[16px] hidden group-hover:flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 12 12"
                                            fill="none"
                                        >
                                            <path
                                                d="M4 2L8 6L4 10"
                                                stroke="#3366FF"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                    </i>
                                    {item.text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-[58px] flex w-full items-center justify-between text-[12px] text-[#7A8799]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                    >
                        <path d="M4 2L8 6L4 10" stroke="#3366FF" strokeWidth="1.5" />
                    </svg>
                    <p className="flex flex-1 border-b border-dashed border-[#80B5FF]"></p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                    >
                        <path d="M8 2L4 6L8 10" stroke="#3366FF" strokeWidth="1.5" />
                    </svg>
                </div>

                <div className="mt-[25px] flex w-full justify-between text-[12px] text-[#7A8799]">
                    <p>{/* Terms & Conditions */}</p>
                    <p>© 2024 Yuku.app All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
