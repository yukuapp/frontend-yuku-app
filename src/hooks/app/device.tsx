import { useEffect } from 'react';
import { useWindowSize } from 'usehooks-ts';
import { useDeviceStore } from '@/stores/device';

export const watchDevice = () => {
    const size = useWindowSize();

    const reload = useDeviceStore((s) => s.reloadDeviceInfo);

    useEffect(reload, [size]);
};

export const BrowserView = ({ children }) => {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    if (isMobile) return <></>;
    return <>{children}</>;
};

export const MobileView = ({ children }) => {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);
    if (!isMobile) return <></>;
    return <>{children}</>;
};
