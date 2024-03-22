import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { isDevMode } from '@/utils/app/env';
import { queryAnnouncementList } from '@/utils/canisters/yuku-old/application';
import { AppAnnouncement } from '@/canisters/yuku-old/yuku_application';

const isDev = isDevMode();

interface ApplicationState {
    announcements?: AppAnnouncement[];
    reloadAnnouncements: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>()(
    devtools(
        (set) => ({
            announcements: undefined,
            reloadAnnouncements: async () => {
                const announcements = await queryAnnouncementList();
                set({ announcements });
            },
        }),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('ApplicationStore', useApplicationStore);
