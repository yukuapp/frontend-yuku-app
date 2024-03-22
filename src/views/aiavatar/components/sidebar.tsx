import { useLocation, useNavigate } from 'react-router-dom';
import message from '@/components/message';

type NavigateItem = {
    label: string;
    path: string;
    icon: string;
    noReady: boolean;
};
export const useNavigateItems = (): NavigateItem[] => {
    return [
        {
            label: 'Home',
            path: '/AIAvatar/home',
            icon: '/img/aiavatar/home-icon.svg',
            noReady: false,
        },
        {
            label: 'Create',
            path: '/AIAvatar/create',
            icon: '/img/aiavatar/create-icon.svg',
            noReady: true,
        },
        {
            label: 'Chats',
            path: '/AIAvatar/chats',
            icon: '/img/aiavatar/chats-icon.svg',
            noReady: true,
        },
        {
            label: 'Me',
            path: '/AIAvatar/user',
            icon: '/img/aiavatar/user-icon.svg',
            noReady: true,
        },
    ];
};

function Sidebar() {
    const { pathname } = useLocation();
    const navigator = useNavigate();
    const items = useNavigateItems();

    return (
        <div className="fixed bottom-0 left-0 flex w-full flex-shrink-0 bg-[#191E2E] md:relative md:mt-[46px] md:w-[110px] md:flex-col md:bg-transparent">
            {items.map((item, index) => (
                <div
                    // to={item.path}
                    key={index}
                    className="group flex flex-1 cursor-pointer flex-col items-center justify-center py-[10px] md:mb-[49px] md:flex-none md:py-0"
                    onClick={() => {
                        if (item.noReady) return message.success('Coming soon');
                        navigator(item.path);
                    }}
                >
                    <img
                        className={`h-[28px] w-[28px] opacity-70 duration-300 group-hover:opacity-100 md:h-[34px] md:w-[34px] ${
                            pathname === item.path ? '!opacity-100' : 'opacity-70'
                        }`}
                        src={item.icon}
                        alt=""
                    />
                    <div
                        className={`mt-[5px] text-center font-inter-medium text-[14px] font-semibold text-white text-opacity-70 duration-300 group-hover:text-opacity-100 md:mt-[15px] md:text-[16px] ${
                            pathname === item.path ? '!text-opacity-100' : 'text-opacity-70'
                        }`}
                    >
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Sidebar;
