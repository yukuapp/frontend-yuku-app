import { Link, useLocation } from 'react-router-dom';
import { IconLogoShiku } from '@/components/icons';
import { cn } from '@/common/cn';

type NavigateItem = {
    label: string;
    path: string;
    alias: string[];
    children?: { label: string; path: string }[];
};
export const useNavigateItems = (): NavigateItem[] => {
    return [
        {
            label: 'Marketplace',
            path: '/marketplace/explore',
            alias: ['/marketplace'],
        },
        {
            label: '3D Space',
            path: '/3DSpace',
            alias: ['/3DSpace/'],
        },
        {
            label: 'AI Avatar',
            path: '/AIAvatar',
            alias: ['/AIAvatar/'],
        },
    ];
};
export function MainNav() {
    const { pathname } = useLocation();
    const items = useNavigateItems();
    const currentLabel = items.find(
        (s) => s.path === pathname || s.alias.find((a) => pathname.startsWith(a)),
    );
    return (
        <div className="flex h-full gap-6 md:gap-x-[25px]">
            <Link to="/" className="flex items-center space-x-2">
                <IconLogoShiku className="h-[28px] flex-shrink-0 cursor-pointer bg-cover bg-center bg-no-repeat md:h-[35px]" />
            </Link>
            <div className="ml-[10px] hidden items-center lg:flex">
                <nav className="ml-5 flex h-full items-center gap-4 lg:gap-[50px]">
                    {items.map((item, index) => (
                        <div key={index} className="flex h-full flex-col items-center">
                            <div className="group relative h-full items-center">
                                <Link
                                    to={item.path}
                                    className={cn([
                                        'relative flex h-full min-w-[60px] flex-col items-center justify-center font-inter-medium text-[15px] text-sm font-semibold text-white/60 duration-150 group-hover:text-white md:text-base',
                                        item.label === currentLabel?.label && 'text-white',
                                    ])}
                                >
                                    <div>{item.label}</div>
                                    {item.label === currentLabel?.label && (
                                        <img
                                            className="absolute bottom-[10px] w-[60px]"
                                            src="/img/head/menu-active.svg"
                                        ></img>
                                    )}
                                </Link>
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </div>
    );
}
