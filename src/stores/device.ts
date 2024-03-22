import { getSelectorsByUserAgent, isMobile } from 'react-device-detect';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { isDevMode } from '@/utils/app/env';
import { isSame } from '@/common/data/same';

const isDev = isDevMode();

type DeviceInfo = {
    // width_type: 'mobile' | 'pad' | 'pc';
    isMobile: boolean;
};

interface DeviceState {
    deviceInfo: DeviceInfo;
    reloadDeviceInfo: () => void;
}

const reload = (): DeviceInfo => {
    // const width = document.getElementsByTagName('body')[0].offsetWidth;
    // const width_type = (() => {
    //     if (width < 1024) return 'mobile';
    //     if (width <= 1080) return 'pad';
    //     return 'pc';
    // })();

    const userAgent = navigator.userAgent;
    const runtime = getSelectorsByUserAgent(userAgent);
    // console.debug(`🚀 ~ file: device.ts:33 ~ reload ~ runtime:`, runtime);

    const info: DeviceInfo = {
        // width_type,
        isMobile: runtime?.isMobile ?? isMobile,
    };
    return info;
};

export const useDeviceStore = create<DeviceState>()(
    devtools(
        (set, get) => ({
            deviceInfo: (() => {
                const info = reload();
                console.debug('device', info);
                return info;
            })(),
            reloadDeviceInfo: () => {
                const info = reload();
                if (!isSame(get().deviceInfo, info)) {
                    console.debug('device', info);
                    set({ deviceInfo: info });
                }
            },
        }),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('DeviceStore', useDeviceStore);
