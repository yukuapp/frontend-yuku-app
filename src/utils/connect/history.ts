import { ConnectedRecord, ConnectType } from '@/types/identity';

export const getLatestConnectType = (
    records: ConnectedRecord[],
): ConnectType | undefined | 'email' => {
    if (records.length === 0) return undefined;
    if (records.length === 1) return records[0].connectType;
    const latestRecord = records.reduce((p, c) => (p.timestamp <= c.timestamp ? c : p));
    return latestRecord?.connectType;
};
