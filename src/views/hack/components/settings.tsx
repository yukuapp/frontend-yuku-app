import { useEffect } from 'react';
import { Modal } from 'antd';
import { useConnect } from '@connect2ic/react';
import { useLocalStorage } from 'usehooks-ts';
import { getYukuApiHost, getYukuDataHost } from '@/utils/apis/yuku/special';
import { getInitialBackendType } from '@/utils/app/backend';
import { getBuildMode, getConnectDerivationOrigin } from '@/utils/app/env';
import { BACKEND_TYPE, writeLastConnectType } from '@/utils/app/storage';
import { getLedgerIcpCanisterId, getLedgerOgyCanisterId } from '@/utils/canisters/ledgers/special';
import {
    getYukuApplicationCanisterId,
    getYukuArtistRouterCanisterId,
    getYukuCccProxyCanisterId,
    getYukuCoreCanisterId,
    getYukuCreditPointsCanisterId,
    getYukuJwtTokenCanisterId,
    getYukuOatCanisterId,
    getYukuShikuLandsCollection,
    getYukuUserRecordCanisterId,
} from '@/utils/canisters/yuku-old/special';
import { useAppStore } from '@/stores/app';
import { useIdentityStore } from '@/stores/identity';
import { SupportedBackend } from '@/types/app';

const showCanisterId = (canister_id: string) => {
    return (
        <a href={`https://icscan.io/canister/${canister_id}`} target="_blank">
            {canister_id}
        </a>
    );
};

const BACKEND_TYPES: SupportedBackend[] = ['production', 'staging', 'test'];
let nextBackendType: SupportedBackend | '' = '';
const { confirm } = Modal;
const showBackendTypeConfirm = (onOk: () => void, onCancel: () => void) => {
    confirm({
        title: 'Warning',
        content:
            'Are you sure you want to switch backend canisters? This will log out and refresh the page.',
        onOk,
        onCancel,
        className: 'hack-settings-backend-modal',
    });
};

function Settings() {
    const theme = useAppStore((s) => s.theme);
    const setTheme = useAppStore((s) => s.setTheme);

    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);
    const { disconnect } = useConnect({
        onDisconnect: () => setConnectedIdentity(undefined),
    });

    const mode = getBuildMode();
    const [backendType, setBackendType] = useLocalStorage<SupportedBackend>(
        BACKEND_TYPE,
        getInitialBackendType(),
    );
    const saveBackendType = (backend: SupportedBackend) => {
        nextBackendType = backend;

        showBackendTypeConfirm(
            () => {
                writeLastConnectType('');
                disconnect();
                setBackendType(backend);
            },
            () => (nextBackendType = ''),
        );
    };
    useEffect(() => {
        // console.log('hack info', backendType, '<===>', nextBackendType);
        if (nextBackendType === backendType) setTimeout(() => location.reload(), 0);
    }, [backendType]);

    const derivationOrigin = getConnectDerivationOrigin();

    const backend_canister_id_ledger_icp = getLedgerIcpCanisterId();
    const backend_canister_id_ledger_ogy = getLedgerOgyCanisterId();

    const backend_canister_id_yuku_core = getYukuCoreCanisterId();
    const backend_canister_id_yuku_credit_points = getYukuCreditPointsCanisterId();
    const backend_canister_id_yuku_artist_router = getYukuArtistRouterCanisterId();
    const backend_canister_id_yuku_user_record = getYukuUserRecordCanisterId();
    const backend_canister_id_yuku_ccc_proxy = getYukuCccProxyCanisterId();
    const backend_canister_id_yuku_application = getYukuApplicationCanisterId();
    const backend_canister_id_yuku_oat = getYukuOatCanisterId();
    const backend_canister_id_yuku_shiku_lands = getYukuShikuLandsCollection();
    const backend_canister_id_yuku_jwt_token = getYukuJwtTokenCanisterId();

    const backend_host_yuku_api = getYukuApiHost();
    const backend_host_yuku_data = getYukuDataHost();

    return (
        <div className="hack-settings">
            <h1>Settings</h1>
            <div className="item theme">
                <div className="label">Current Theme</div>
                <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                    className="text-black"
                >
                    {['light', 'dark'].map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>
            <div className="item backend-type">
                <div className="label">Current Backend</div>
                {['production', 'staging', 'test'].includes(mode) ? (
                    mode
                ) : (
                    <select
                        className={backendType}
                        value={backendType}
                        onChange={(e) => saveBackendType(e.target.value as SupportedBackend)}
                    >
                        {BACKEND_TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="item derivation-origin">
                <div className="label">Login Anchor</div>
                {derivationOrigin ? (
                    <div>
                        <a href={derivationOrigin}>{derivationOrigin}</a>
                    </div>
                ) : (
                    <div>None</div>
                )}
            </div>
            <div className="item canister-ledger-icp">
                <div className="label">ICP Canister</div>
                <div>{showCanisterId(backend_canister_id_ledger_icp)}</div>
            </div>
            <div className="item canister-ledger-ogy">
                <div className="label">OGY Canister</div>
                <div>{showCanisterId(backend_canister_id_ledger_ogy)}</div>
            </div>
            <div className="item canister-yuku-core">
                <div className="label">Core Canister</div>
                <div>{showCanisterId(backend_canister_id_yuku_core)}</div>
            </div>
            <div className="item canister-yuku-credit-points">
                <div className="label">Credit Points Canister</div>
                <div>{showCanisterId(backend_canister_id_yuku_credit_points)}</div>
            </div>
            <div className="item canister-yuku-artist-router">
                <div className="label">Art Canister</div>
                <div>{showCanisterId(backend_canister_id_yuku_artist_router)}</div>
            </div>
            <div className="item canister-yuku-user-record">
                <div className="label">User Canister</div>
                <div>{showCanisterId(backend_canister_id_yuku_user_record)}</div>
            </div>
            <div className="item canister-yuku-ccc-proxy">
                <div className="label">CCC Proxy</div>
                <div>{showCanisterId(backend_canister_id_yuku_ccc_proxy)}</div>
            </div>
            <div className="item canister-yuku-application">
                <div className="label">Apply</div>
                <div>{showCanisterId(backend_canister_id_yuku_application)}</div>
            </div>
            <div className="item canister-yuku-oat">
                <div className="label">OAT</div>
                <div>{showCanisterId(backend_canister_id_yuku_oat)}</div>
            </div>
            <div className="item canister-yuku-shiku-lands">
                <div className="label">ShikuLands</div>
                <div>{showCanisterId(backend_canister_id_yuku_shiku_lands)}</div>
            </div>
            <div className="item canister-yuku-jwt-token">
                <div className="label">JwtToken</div>
                <div>{showCanisterId(backend_canister_id_yuku_jwt_token)}</div>
            </div>
            <div className="item host-yuku-api">
                <div className="label">YUKU API Backend</div>
                <div>{backend_host_yuku_api}</div>
            </div>
            <div className="item host-yuku-api2">
                <div className="label">YUKU API Backend (data related)</div>
                <div>{backend_host_yuku_data}</div>
            </div>
        </div>
    );
}

export default Settings;
