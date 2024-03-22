import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { isDevMode } from '@/utils/app/env';

const GA_TOKEN = 'G-EFVGBS3EJH';

export default function useGA() {
    useEffect(() => {
        if (!isDevMode()) {
            ReactGA.initialize(GA_TOKEN);
        }
    }, []);
    return;
}
