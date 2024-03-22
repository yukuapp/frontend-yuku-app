import { memo, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, Tooltip } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { shallow } from 'zustand/shallow';
import { IconLogoShiku, IconWallet } from '@/components/icons';
import { MainNav, useNavigateItems } from '@/components/layout/components/main-nav';
import { Button } from '@/components/ui/button';
import CloseIcon from '@/components/ui/close-icon';
import YukuIcon from '@/components/ui/yuku-icon';
import CreateBtn from '@/views/world/components/create-btn';
import { cn } from '@/common/cn';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { ShoppingCartItem } from '@/types/yuku';
import './index.less';

export const SiteHeader = memo(() => {
    const [menuDrawer, setMenuDrawer] = useState(false);
    const { scrollY } = useScroll();
    const [scrollYValue, setScrollYValue] = useState<number>(0);
    // const height = window.innerHeight / 2;
    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrollYValue(latest);
    });
    // const user_token = useIdentityStore((s) => s.identityProfile?.yuku_token);

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 z-50  mx-auto flex h-[44px]  w-full items-center justify-between bg-[#101522] px-[20px] transition-all duration-300  md:h-[75px] md:px-[30px]',
                    `bg-transparent ${scrollYValue > 0 ? 'backdrop-blur-[20px]' : ''}`,
                )}
            >
                <div className="flex h-full w-full items-center sm:justify-between sm:space-x-0">
                    <MainNav />
                    <div className="flex flex-1 items-center justify-end space-x-[27px]">
                        {/* {user_token && (
                            <Link to={'/world'} rel="noreferrer">
                                <Button className="hidden h-[44px] flex-shrink-0 items-center rounded-[8px] bg-white/20 px-[12px] py-[11px] text-center align-top font-inter-bold text-[12px] text-white duration-300 hover:bg-white/30 md:flex lg:px-[19px] lg:text-[14px]">
                                    <p className="ml-[11px]">My World</p>
                                </Button>
                            </Link>
                        )} */}
                        <YukuIcon
                            name="action-menu"
                            size={26}
                            color="white"
                            className="cursor-pointer lg:hidden"
                            onClick={() => setMenuDrawer(true)}
                        />
                        {!isMobile && <HeaderMyWorld />}
                        {/* <HeaderNotice /> */}
                        <HeaderCart />
                        <HeaderIdentity />
                    </div>
                </div>{' '}
            </header>
            <HeaderDrawer menuDrawer={menuDrawer} setMenuDrawer={setMenuDrawer} />
        </>
    );
});

const HeaderMyWorld = () => {
    const getYukuToken = useIdentityStore((s) => s.getYukuToken);
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity);
    const identityProfile = useIdentityStore((s) => s.identityProfile);
    const token = connectedIdentity && getYukuToken();
    const { createTooltipOpen, setCreateTooltipOpen } = useAppStore(
        (s) => ({
            createTooltipOpen: s.createTooltipOpen,
            setCreateTooltipOpen: s.setCreateTooltipOpen,
        }),
        shallow,
    );
    const active = token || identityProfile?.yuku_token;
    return (
        <>
            {connectedIdentity && (
                <Tooltip
                    title={
                        <div className="flex flex-col items-center justify-between">
                            <CloseIcon
                                className="ml-auto text-sm"
                                onClick={() => {
                                    setCreateTooltipOpen(false);
                                }}
                            ></CloseIcon>
                            <Link
                                to={isMobile ? '/world/space' : '/world/space/create'}
                                className="hover:text-white"
                            >
                                <CreateBtn
                                    onClick={() => {
                                        setCreateTooltipOpen(false);
                                    }}
                                    className="mt-[15px]"
                                ></CreateBtn>
                            </Link>
                            <div className="mt-[15px] text-center font-inter-medium text-sm">
                                {isMobile
                                    ? 'Please create the space on the computer'
                                    : 'Start to own your spaces'}
                            </div>
                        </div>
                    }
                    open={!!active && createTooltipOpen}
                    overlayClassName="my-world-tooltip"
                    defaultOpen
                    overlayStyle={{
                        position: 'fixed',
                        zIndex: 100,
                    }}
                    overlayInnerStyle={{
                        width: isMobile ? 200 : 251,
                        padding: '20px 20px 35px 20px',
                        backgroundColor: '#191E2E',
                        borderRadius: '24px',
                    }}
                    arrowContent={
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="11"
                            viewBox="0 0 32 11"
                            fill="none"
                        >
                            <path
                                d="M13.1808 0.814825C14.6061 -0.259547 16.5708 -0.259547 17.9961 0.814824L31.1769 10.75H0L13.1808 0.814825Z"
                                fill="#191E2E"
                            />
                        </svg>
                    }
                    placement="bottomRight"
                >
                    <Link to={active ? '/world' : ''} rel="noreferrer">
                        <Button className="relative hidden h-[44px] flex-shrink-0 items-center rounded-[8px] bg-white/20 py-[11px] pl-[25px] pr-[12px] text-center align-top font-inter-bold text-[12px] text-white duration-300 hover:bg-white/30 md:flex lg:pl-[32px] lg:pr-[20px] lg:text-[14px]">
                            <div className="absolute left-[10px] top-[7px] h-[31px] w-[31px] overflow-hidden lg:left-[13px]">
                                <div className="absolute left-0 top-0 flex h-full flex-col items-center justify-center">
                                    <Swiper
                                        direction={'vertical'}
                                        spaceBetween={80}
                                        centeredSlides={true}
                                        autoplay={{
                                            delay: 3000,
                                            disableOnInteraction: false,
                                        }}
                                        effect={'fade'}
                                        loop={true}
                                        modules={[Autoplay]}
                                        className="mySwiper"
                                    >
                                        <SwiperSlide>
                                            <img
                                                alt=""
                                                className="h-full max-w-none"
                                                src={'/img/world/model-img1.png'}
                                            />
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <img
                                                alt=""
                                                className="h-full max-w-none"
                                                src={'/img/world/model-img3.png'}
                                            />
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <img
                                                alt=""
                                                className="h-full max-w-none"
                                                src={'/img/world/model-img2.png'}
                                            />
                                        </SwiperSlide>
                                    </Swiper>
                                </div>
                            </div>
                            <p className="ml-[20px] flex w-[65px]">
                                {active ? (
                                    'My World'
                                ) : (
                                    <LoadingOutlined className="mx-auto"></LoadingOutlined>
                                )}
                            </p>
                        </Button>
                    </Link>
                </Tooltip>
            )}
        </>
    );
};

// const HeaderNotice = () => {
//     const [showNoticeDrawer, setShowNoticeDrawer] = useState(false);
//     const identity = useIdentityStore((s) => s.connectedIdentity);
//     const { artist } = useArtists();

//     return (
//         <>
//             {identity && artist ? (
//                 <div className="relative cursor-pointer">
//                     <YukuIcon
//                         name="action-notice"
//                         size={24}
//                         color="white"
//                         onClick={() => setShowNoticeDrawer(!showNoticeDrawer)}
//                     />
//                 </div>
//             ) : (
//                 <></>
//             )}
//             <NoticeDrawer
//                 showNoticeDrawer={showNoticeDrawer}
//                 setShowNoticeDrawer={setShowNoticeDrawer}
//             />
//         </>
//     );
// };

const HeaderCart = () => {
    const shoppingCartItems = useIdentityStore((s) => s.shoppingCartItems);
    const toggleShowShoppingCart = useIdentityStore((s) => s.toggleShowShoppingCart);
    const items: ShoppingCartItem[] = shoppingCartItems ?? [];
    return (
        <>
            <div
                className="relative flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[4px] bg-[#fff]/20 md:h-[44px] md:w-[44px] md:rounded-[8px]"
                onClick={toggleShowShoppingCart}
            >
                <YukuIcon
                    name="action-cart"
                    size={24}
                    color="#fff"
                    className="scale-75 md:scale-100"
                />
                {items.length ? (
                    <span className="absolute -bottom-1 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] bg-[#ff4d4f] px-[4px] font-inter-medium text-[13px] text-[#fff]">
                        <p className="scale-75">{items.length}</p>
                    </span>
                ) : (
                    ''
                )}
            </div>
        </>
    );
};

const HeaderIdentity = () => {
    const { t } = useTranslation();
    const identity = useIdentityStore((s) => s.connectedIdentity);
    const profile = useIdentityStore((s) => s.identityProfile);

    const toggleIsUserSidebarIdOpen = useIdentityStore((s) => s.toggleIsUserSidebarIdOpen);
    const loadingProfile = useIdentityStore((s) => s.loadingProfile);
    return (
        <div>
            {identity ? (
                <div
                    className="relative flex h-[24px] w-[24px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-gray-300 hover:border-[1px] hover:border-black md:h-[44px] md:w-[44px]"
                    onClick={toggleIsUserSidebarIdOpen}
                >
                    {!loadingProfile ? (
                        <img
                            className="absolute left-0 top-0 h-full w-full bg-white"
                            src={profile?.avatar}
                            alt=""
                        />
                    ) : (
                        <LoadingOutlined />
                    )}
                </div>
            ) : (
                <>
                    <Link to={'/connect'} rel="noreferrer">
                        <Button className="hidden h-[44px] flex-shrink-0 items-center rounded-[8px] bg-white/20 px-[12px] py-[11px] text-center align-top font-inter-bold text-[12px] text-white duration-300 hover:bg-white/30 md:flex lg:px-[19px] lg:text-[14px]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M20.8403 6.07962H14.6555V5.8121C14.7227 3.67197 12.9748 2 10.8235 2H3.83193C1.68067 2 2.88866e-08 3.73885 0 5.8121V19.8567C0 21.5955 1.41176 23 3.15966 23H20.8403C22.5882 23 24 21.5955 24 19.8567V9.15605C24 7.48408 22.5882 6.07962 20.8403 6.07962ZM2.01681 5.8121C2.01681 4.80892 2.82353 4.00637 3.83193 4.00637H10.8235C11.8319 4.00637 12.6387 4.80892 12.6387 5.8121V6.07962H2.01681V5.8121ZM20.8403 20.9936H3.15966C2.55462 20.9936 2.01681 20.5255 2.01681 19.8567V8.08599H20.8403C21.4454 8.08599 21.9832 8.55414 21.9832 9.22293V10.7611H16.2689C14.1849 10.7611 12.5714 12.4331 12.5714 14.4395V14.707C12.5714 16.7803 14.2521 18.3853 16.2689 18.3853H21.9832V19.8567C21.9832 20.5255 21.4454 20.9936 20.8403 20.9936ZM21.8487 12.7675V16.379H16.2689C15.3277 16.379 14.5882 15.6433 14.5882 14.707V14.5064C14.5882 13.5701 15.3277 12.8344 16.2689 12.8344H21.8487V12.7675Z"
                                    fill="white"
                                />
                            </svg>
                            <p className="ml-[11px]">{t('home.nav.connect')}</p>
                        </Button>
                        <IconWallet className="block w-[20px] md:hidden " />
                    </Link>
                </>
            )}
        </div>
    );
};

const HeaderDrawer = ({
    menuDrawer,
    setMenuDrawer,
}: {
    menuDrawer: boolean;
    setMenuDrawer: (open: boolean) => void;
}) => {
    const items = useNavigateItems();
    const { pathname } = useLocation();
    return (
        <Drawer
            title="Basic Drawer"
            placement="top"
            styles={{
                header: { display: 'none' },
                body: { padding: 0, backgroundColor: '#101522' },
            }}
            height={window.outerHeight}
            onClose={() => setMenuDrawer(false)}
            open={menuDrawer}
            className="menu-drawer"
        >
            <div className="flex h-[44px] w-full  items-center justify-between border-b border-common px-[20px]">
                <IconLogoShiku className="h-[28px] w-[105px] flex-shrink-0 cursor-pointer bg-cover bg-center bg-no-repeat" />

                <YukuIcon
                    name="action-close"
                    color="#fff"
                    className="!text-lg"
                    onClick={() => setMenuDrawer(false)}
                />
            </div>
            <nav className="flex flex-col">
                {items.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={cn([
                            'mx-5 flex h-12 items-center border-b font-inter-semibold text-[16px] text-white/60',
                            item.path === pathname && 'text-shiku',
                        ])}
                        onClick={() => setMenuDrawer(false)}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </Drawer>
    );
};
