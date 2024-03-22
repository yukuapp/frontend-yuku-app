import { useLocation } from 'react-router-dom';
import { cn } from '@/common/cn';
import { PreloadIcons } from '../icons';
import Cart from './components/cart';
import Footer from './components/footer';
import { SiteHeader } from './components/site-header';
import TailwindIndicator from './components/tailwind-indicator';
import TransactionNotification from './components/transaction';
import UserSidebar from './components/user-sidebar';
import { FundsModal } from './components/user-sidebar/funds';
import GenerationModal from './components/user-sidebar/generation-modal';

function PageLayout({ children }) {
    // const theme = useAppStore((s) => s.theme);

    document.documentElement.classList.add('dark');
    // useEffect(() => {
    //     if (theme === 'dark') {
    //         document.documentElement.classList.add('dark');
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //     }
    // }, [theme]);
    const { pathname } = useLocation();
    const hasPaddingTop = pathname.indexOf('/marketplace') !== -1;
    return (
        <div className="relative flex min-h-screen flex-col bg-[#101522] font-inter-regular">
            <SiteHeader />
            <div
                className={cn('mx-auto w-screen flex-1', hasPaddingTop && 'pt-[44px] md:pt-[75px]')}
            >
                {children}
            </div>

            <UserSidebar />
            <FundsModal />
            {/* <BuyRecorder /> */}
            <TransactionNotification />
            <Cart />
            <PreloadIcons />

            <Footer />
            <GenerationModal></GenerationModal>
            <TailwindIndicator />
        </div>
    );
}
export default PageLayout;
