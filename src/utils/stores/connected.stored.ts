import { ConnectedRecord } from '@/types/identity';
import { CombinedStore } from '../stored';

const connected_record_store = new CombinedStore<ConnectedRecord[]>(
    1000 * 3600 * 24 * 365 * 100,
    false,
    {
        key_name: `__yuku_collected_record_keys__`,
        indexed_key: () => `__yuku_collected_record__`,
    },
);
export const connectedRecordsStored = {
    getItem: (): Promise<ConnectedRecord[]> =>
        new Promise((resolve) => {
            connected_record_store
                .getItem('')
                .then((d) => resolve(d ?? []))
                .catch(() => resolve([]));
        }),
    setItem: (records: ConnectedRecord[]): Promise<void> =>
        connected_record_store.setItem('', records),
};
