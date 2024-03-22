import { useEffect } from 'react';
import { useConnect } from '@connect2ic/react';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import _ from 'lodash';
import { shallow } from 'zustand/shallow';
import message from '@/components/message';
import { checkToken } from '@/utils/apis/yuku/api';
import { queryTokenExchangePriceList } from '@/utils/apis/yuku/api_data';
import { getConnectHost } from '@/utils/app/env';
import {
    readLastConnectEmail,
    readLastUsedType,
    readStorage,
    UNITY_USER_TOKEN,
    writeStorage,
} from '@/utils/app/storage';
import { combinedQueryCorePlatformFee } from '@/utils/combined/yuku/core';
import { checkConnected, getWhitelist } from '@/utils/connect/connect';
import { resetWhitelist } from '@/utils/connect/whitelist';
import { ALL_COLLECTIONS } from '@/utils/connect/whitelist_all';
import { getActorCreatorByAgent } from '@/common/connect/creator';
import { principal2account } from '@/common/ic/account';
import { FirstRender } from '@/common/react/render';
import { Spend } from '@/common/react/spend';
import { setLanguage } from '@/locales';
import { useAppStore } from '@/stores/app';
import { useCollectionStore } from '@/stores/collection';
import { useIdentityStore } from '@/stores/identity';
import { ConnectedIdentity } from '@/types/identity';
import { anonymous } from '../../utils/connect/anonymous';

const initLanguage = () => {
    const current = useAppStore((s) => s.language);
    useEffect(() => setLanguage(current), []);
};

const once_check_connected = new FirstRender();
const once_connected_identity_subscribe = new FirstRender();
const initIdentity = () => {
    const connectedIdentity = useIdentityStore((s) => s.connectedIdentity, shallow);
    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);

    const handleIdentity = (identity: ConnectedIdentity) => setConnectedIdentity(identity);
    // const getYukuToken = useIdentityStore((s) => s.getYukuToken);

    const {
        reloadIdentityProfile,
        reloadJwtToken,
        reloadFavorited,
        reloadShoppingCartItems,
        reloadByIdentity,
        connect2YukuByPrincipal,
    } = useIdentityStore((s) => s);

    const {
        isConnected,
        activeProvider: provider,
        principal,
    } = useConnect({
        onConnect: (connected: any) => {
            const principal = connected.principal;
            const provider = connected.activeProvider;
            // console.error('app onConnect', principal, provider);
            checkConnected(
                connectedIdentity,
                {
                    isConnected: true,
                    principal,
                    provider,
                },
                () => {},
                async (identity) => handleIdentity(identity),
            );
        },
        onDisconnect: () => setConnectedIdentity(undefined),
    });

    useEffect(
        once_check_connected.once(() => {
            if (readLastUsedType() === 'email') {
                const email = readLastConnectEmail();
                if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
                    const v = readStorage(`${UNITY_USER_TOKEN}${email}`);
                    if (v) {
                        const v_json = JSON.parse(v);

                        checkToken({
                            user_id: v_json.user_id,
                            user_token: v_json.user_token,
                        })
                            .then((r) => {
                                if (r) {
                                    const icFound = r?.view.identity_list.find(
                                        (i) => i['EscrowInternetComputer']?.network === 'Ic',
                                    );
                                    const principal =
                                        icFound && icFound['EscrowInternetComputer']?.principal;
                                    const hash = icFound && icFound['EscrowInternetComputer']?.hash;
                                    writeStorage(
                                        `${UNITY_USER_TOKEN}${email}`,
                                        JSON.stringify({
                                            user_id: r?.user_id,
                                            user_token: r?.token,
                                        }),
                                    );
                                    setConnectedIdentity({
                                        connectType: 'email',
                                        creator: anonymous.creator,
                                        requestWhitelist: async () => true,
                                        main_email: email,
                                        user_id: v_json.user_id,
                                        principal,
                                        account: principal
                                            ? principal2account(principal)
                                            : undefined,
                                        hash,
                                    });
                                }
                            })
                            .catch((e) =>
                                message.error('Email token expired, please login again!' + e),
                            );
                        return;
                    }
                }
            }

            checkConnected(
                connectedIdentity,
                {
                    isConnected,
                    principal,
                    provider,
                },
                () => {},
                async (identity) => handleIdentity(identity),
            );
            const icx = (window as any).icx;
            const got_identity = (identity: any) => {
                const agent = new HttpAgent({
                    identity,
                    host: getConnectHost(),
                });
                agent.getPrincipal().then((principal: Principal) => {
                    setConnectedIdentity({
                        connectType: 'me',
                        principal: principal.toText(),
                        account: principal2account(principal.toText()),
                        creator: getActorCreatorByAgent(agent),
                        requestWhitelist: async () => true,
                    });
                });
            };
            if (icx) {
                icx.init().then(() => {
                    if (!icx.identity) {
                        let whitelist = getWhitelist();
                        whitelist = [...whitelist, ...ALL_COLLECTIONS];
                        whitelist = _.uniq(whitelist);
                        icx.reconnect({
                            delegationTargets: whitelist,
                        }).then(() => {
                            if (icx.identity) {
                                got_identity(icx.identity);
                            } else {
                                alert('Connect failed');
                            }
                        });
                    } else {
                        got_identity(icx.identity);
                    }
                });
            }
        }),
        [],
    );

    useEffect(
        once_connected_identity_subscribe.once(() => {
            useIdentityStore.subscribe(
                (s) => s.connectedIdentity,
                async (nv, _ov) => {
                    if (nv) {
                        if (nv.connectType === 'email') {
                            reloadIdentityProfile(3);
                        } else {
                            await connect2YukuByPrincipal();
                            resetWhitelist();

                            reloadIdentityProfile(3).finally(() => {
                                Promise.all([
                                    reloadJwtToken(2),
                                    reloadFavorited(),
                                    reloadShoppingCartItems(),
                                ]).finally(() => reloadByIdentity(nv));
                            });
                        }
                    }
                },
                {
                    equalityFn: (nv, ov) =>
                        nv === ov ||
                        (!!ov &&
                            ov.connectType === nv?.connectType &&
                            ov.principal === nv?.principal),
                },
            );
        }),
        [],
    );
};

const once_load_collection_list = new FirstRender();
const initCollectionList = () => {
    const {
        reloadCoreCollectionIdList,
        reloadArtistCollectionIdList,
        reloadCoreCollectionDataList,
        reloadArtistCollectionDataList,
    } = useCollectionStore((s) => s);

    useEffect(
        once_load_collection_list.once(() => {
            const spend_load = Spend.start('load collection id and data list');
            Promise.all([
                reloadCoreCollectionIdList(),
                reloadArtistCollectionIdList(),

                reloadCoreCollectionDataList(),
                reloadArtistCollectionDataList(),
            ]).then(() => {
                spend_load.mark();
            });
        }),
        [],
    );
};

export const initTokenUsdRateAndPlatformFee = () => {
    const { setIcpUsd, setOgyUsd, setYukuPlatformFee } = useAppStore((s) => s);

    useEffect(() => {
        queryTokenExchangePriceList().then((d) => {
            for (const item of d) {
                switch (item.symbol) {
                    case 'ICP':
                        setIcpUsd(item.price);
                        continue;
                    case 'OGY':
                        setOgyUsd(item.price);
                        continue;
                }
            }
        });

        combinedQueryCorePlatformFee().then(setYukuPlatformFee);
    }, []);
};

export const initial = () => {
    initLanguage();

    initIdentity();

    initCollectionList();

    initTokenUsdRateAndPlatformFee();
};
