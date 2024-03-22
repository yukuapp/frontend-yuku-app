import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { useConnect } from '@connect2ic/react';
import { shallow } from 'zustand/shallow';
import {
    writeLastConnectEmail,
    writeLastConnectType,
    writeLastUsedType,
} from '@/utils/app/storage';
import { getYukuCoreCanisterId } from '@/utils/canisters/yuku-old/special';
import { checkConnected } from '@/utils/connect/connect';
import { resetWhitelist } from '@/utils/connect/whitelist';
import { connectedRecordsStored } from '@/utils/stores/connected.stored';
import { registerUser } from '@/canisters/yuku-old/yuku_core';
import { FirstRender, FirstRenderWithData } from '@/common/react/render';
import { useConnectedStore } from '@/stores/connected';
import { useDeviceStore } from '@/stores/device';
import { useIdentityStore } from '@/stores/identity';
import { ConnectedIdentity, ConnectedRecord, ConnectType } from '@/types/identity';

const CONNECTED_TYPES: ConnectType[] = ['plug', 'ii', 'me', 'infinity', 'nfid', 'stoic'];
const MOBILE_HIDDEN_CONNECTED_TYPES: ConnectType[] = ['infinity', 'plug'];

type ConnectRecord = {
    type: ConnectType;
    connectIdentities: number;
    allConnectTimes: number;
    latestPrincipal: string;
    latestTimestamp: number;
};

export const useConnectHooks = (): {
    records: ConnectRecord[];
    onConnect: (type: ConnectType) => void;
} => {
    const navigate = useNavigate();
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    const [once_clicked_connect_type] = useState(
        new FirstRenderWithData<ConnectType | undefined>(undefined),
    );

    useEffect(() => once_clicked_connect_type.set(undefined), []);

    const [connectedRecords, setConnectedRecords] = useState<ConnectedRecord[]>([]);
    useEffect(() => {
        connectedRecordsStored.getItem().then(setConnectedRecords);
    }, []);

    const records: ConnectRecord[] = useMemo(() => {
        return CONNECTED_TYPES.map((type) => {
            const records = connectedRecords.filter((r) => r.connectType === type);
            const latest =
                records.length === 0
                    ? undefined
                    : records.length === 1
                    ? records[0]
                    : records.reduce((p, c) => (p.timestamp <= c.timestamp ? c : p));
            return {
                type,
                connectIdentities: records.filter(
                    (v, i, a) =>
                        a.findIndex(
                            (vv) =>
                                vv.connectType === v.connectType && vv.principal === v.principal,
                        ) === i, // distinct
                ).length,
                allConnectTimes: records.length,
                latestPrincipal: latest?.principal ?? '--',
                latestTimestamp: latest?.timestamp ?? 0,
            };
        }).filter((r) => !isMobile || !MOBILE_HIDDEN_CONNECTED_TYPES.includes(r.type));
    }, [connectedRecords, isMobile]);

    // const latestContentType: ConnectType | undefined = getLatestConnectType(connectRecords);

    const noticeConnectedRecordsFlag = useConnectedStore((s) => s.noticeConnectedRecordsFlag);
    const registered = useConnectedStore((s) => s.registered);
    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
    const addRegistered = useConnectedStore((s) => s.addRegistered);
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity, shallow);
    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);
    const navigateType = useNavigationType();
    // console.error('navigateType', navigateType);
    const logon = () => {
        // console.error('logon', navigateType, navigateType === 'POP');
        if (navigateType === 'POP') navigate('/');
        else navigate(-1);
    };
    const handleIdentity = (identity: ConnectedIdentity) => {
        // console.warn('🚀 ~ file: index.tsx:53 ~ handleIdentity ~ identity:', identity);
        setConnectedIdentity(identity);
        resetWhitelist();
        once_clicked_connect_type.execute(
            (current) => current === identity.connectType,
            () => {
                writeLastConnectType(identity.connectType);
                writeLastUsedType(identity.connectType);
                if (identity.connectType === 'email') {
                    writeLastConnectEmail(identity.main_email);
                }
                connectedRecordsStored
                    .setItem([
                        ...connectedRecords,
                        {
                            connectType: identity.connectType,
                            principal: identity.principal,
                            timestamp: Date.now(),
                        },
                    ])
                    .then(noticeConnectedRecordsFlag);
            },
        );
    };
    const {
        isConnected,
        connect,
        activeProvider: provider,
        principal,
        // disconnect,
    } = useConnect({
        onConnect: (connected: any) => {
            const principal = connected.principal;
            const provider = connected.activeProvider;
            // console.error('onConnect', principal, provider);
            checkConnected(
                connectedIdentity,
                {
                    isConnected: true,
                    principal,
                    provider,
                },
                logon,
                async (identity) => {
                    if (
                        identity?.principal &&
                        registered[backend_canister_id_yuku_core]?.[identity?.principal] ===
                            undefined
                    ) {
                        // const key = 'registered';
                        // message.loading({
                        //     content: 'loading your account',
                        //     duration: 0,
                        //     key,
                        // });
                        // try {
                        //     console.log(
                        //         'register 1',
                        //         backend_canister_id_yuku_core,
                        //         identity.principal,
                        //     );
                        //     const result = await registerUser(
                        //         identity,
                        //         backend_canister_id_yuku_core,
                        //         identity.principal,
                        //     );
                        //     console.log(
                        //         'register 2',
                        //         backend_canister_id_yuku_core,
                        //         identity.principal,
                        //     );

                        //     message.success({
                        //         content: 'your account is loaded',

                        //         key,
                        //     });
                        // } catch (e) {
                        //     console.error('registered register failed', e);
                        //     message.error({
                        //         content: `register failed: ${e}`,
                        //         duration: 3,

                        //         key,
                        //     });
                        // }

                        registerUser(
                            identity,
                            backend_canister_id_yuku_core,
                            identity.principal,
                        ).then(() => {
                            addRegistered(backend_canister_id_yuku_core, identity.principal!);
                        });
                    }
                    handleIdentity(identity);
                },
            );
        },
        onDisconnect: () => setConnectedIdentity(undefined),
    });
    const [once_check_connected] = useState(new FirstRender());
    useEffect(
        once_check_connected.once(() => {
            checkConnected(
                connectedIdentity,
                {
                    isConnected,
                    principal,
                    provider,
                },
                logon,
                async (identity) => {
                    handleIdentity(identity);
                },
            );
        }),
        [],
    );

    const onConnect = (type: ConnectType) => {
        once_clicked_connect_type.set(type);
        let anchor: string = type;
        if (anchor === 'me') anchor = (window as any).icx ? 'icx' : 'astrox';
        console.log('connect anchor =>', anchor);
        connect(anchor);
    };

    return { records, onConnect };
};
