import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const isSamePage = (last: string, pathname: string, key: string): boolean => {
    return last.indexOf(key) >= 0 && pathname.indexOf(key) >= 0;
};

export const watchScrollToTop = () => {
    const { pathname } = useLocation();

    const [last, setLast] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (last === pathname) return;

        const top = ((): boolean => {
            if (last) {
                if (isSamePage(last, pathname, '/profile')) return false;

                if (isSamePage(last, pathname, '/explore')) return false;

                if (isSamePage(last, pathname, '/shiku')) return false;
            }
            return true;
        })();

        if (top) window.scrollTo(0, 0);
        setLast(pathname);
    }, [last, pathname]);
};
