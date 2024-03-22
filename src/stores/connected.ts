import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { isDevMode } from '@/utils/app/env';

const isDev = isDevMode();

interface ConnectedState {
    connectedRecordsFlag: number;
    noticeConnectedRecordsFlag: () => void;

    registered: Record<string, Record<string, 'registered'>>;
    addRegistered: (backend_canister_id: string, principal: string) => void;
}

export const useConnectedStore = create<ConnectedState>()(
    devtools(
        persist(
            (set, get) => ({
                connectedRecordsFlag: 0,
                noticeConnectedRecordsFlag: () =>
                    set({ connectedRecordsFlag: get().connectedRecordsFlag + 1 }),

                registered: {},
                addRegistered: (backend_canister_id: string, principal: string) => {
                    const old = get().registered;
                    const registered: Record<string, Record<string, 'registered'>> = { ...old };
                    if (registered[backend_canister_id] === undefined)
                        registered[backend_canister_id] = {};
                    const record = registered[backend_canister_id];
                    if (record[principal]) return;
                    record[principal] = 'registered';
                    return set({ registered });
                },
            }),
            {
                name: '__yuku_connected__',
                storage: createJSONStorage(() => localStorage),
            },
        ),
        {
            enabled: isDev,
        },
    ),
);

isDev && mountStoreDevtool('ConnectedStore', useConnectedStore);
