import { createClient as create, IConnector } from '@connect2ic/core';
import { AstroX, ICX, InfinityWallet, StoicWallet } from '@connect2ic/core/providers';
import _ from 'lodash';
import { getActorCreatorByActiveProvider } from '@/common/connect/creator';
import { principal2account } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';
import { ConnectedIdentity, ConnectType } from '@/types/identity';
import { getConnectDerivationOrigin, getConnectHost, isDevMode } from '../app/env';
import { getLedgerIcpCanisterId, getLedgerOgyCanisterId } from '../canisters/ledgers/special';
import {
    getYukuArtistRouterCanisterId,
    getYukuCccProxyCanisterId,
    getYukuCoreCanisterId,
    getYukuJwtTokenCanisterId,
    getYukuLaunchpadCanisterId,
    getYukuOatCanisterId,
} from '../canisters/yuku-old/special';
import { getYukuBusinessCanisterId } from '../canisters/yuku/special';
import { CustomInternetIdentity, getIIFrame } from './providers/ii';
import { CustomNFID } from './providers/nfid';
import { CustomPlugWallet } from './providers/plug';
import { initWhitelist } from './whitelist';
import { ALL_COLLECTIONS } from './whitelist_all';

const isDev = isDevMode();

export const getWhitelist = (): string[] => [
    getLedgerIcpCanisterId(),
    getLedgerOgyCanisterId(),

    getYukuCoreCanisterId(),

    getYukuArtistRouterCanisterId(),

    getYukuCccProxyCanisterId(),
    getYukuLaunchpadCanisterId(),

    getYukuOatCanisterId(),
    getYukuJwtTokenCanisterId(),

    getYukuBusinessCanisterId(),
];

export const createClient = (whitelist?: string[]) => {
    whitelist = whitelist ?? getWhitelist();
    whitelist = [...whitelist, ...ALL_COLLECTIONS];
    whitelist = _.uniq(whitelist);

    initWhitelist(whitelist);

    const derivationOrigin = getConnectDerivationOrigin();
    console.debug(`derivationOrigin ====> ${derivationOrigin}`);

    const astroXProvider = (window as any).icx
        ? new ICX({
              delegationModes: ['domain', 'global'],
              dev: isDev,
          })
        : new AstroX({
              delegationModes: ['domain', 'global'],
              dev: isDev,
          });
    const infinityProvider = new InfinityWallet();

    const iiProvider = new CustomInternetIdentity({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin,
    });

    const plugProvider = new CustomPlugWallet();
    const nfidProvider = new CustomNFID({
        windowOpenerFeatures: window.innerWidth < 768 ? undefined : getIIFrame(),
        derivationOrigin,
    });
    const stoicProvider = new StoicWallet();

    console.debug('whitelist', whitelist);

    const globalProviderConfig = {
        appName: 'Shiku NFT Marketplace',
        dev: false,
        autoConnect: true,
        host: getConnectHost(),
        customDomain: derivationOrigin,
        whitelist,
    };

    return create({
        providers: [
            astroXProvider as any,
            infinityProvider,
            iiProvider,
            plugProvider,
            nfidProvider,
            stoicProvider,
        ],
        globalProviderConfig,
    });
};

export const checkConnected = (
    last: ConnectedIdentity | undefined,
    {
        isConnected,
        principal,
        provider,
    }: {
        isConnected: boolean;
        principal: string | undefined;
        provider: IConnector | undefined;
    },
    callback: () => void,
    handleIdentity: (identity: ConnectedIdentity) => Promise<void>,
    err?: () => void,
) => {
    const failed = () => err && err();
    if (!isConnected) return failed();
    if (!principal || !isPrincipalText(principal)) return failed();
    if (!provider) return failed();
    // console.warn('🚀 ~ file: connect.ts:74 ~ provider:', provider);
    let connectType = provider.meta.id;
    if (['astrox', 'icx'].includes(connectType)) connectType = 'me';
    if (!['ii', 'plug', 'me', 'infinity', 'nfid', 'stoic'].includes(connectType)) {
        console.error(`what a provider id: ${connectType}`);
        return failed();
    }
    if (last?.principal === principal && last?.connectType === connectType) {
        callback();
        return;
    }
    const next: ConnectedIdentity = {
        connectType: connectType as ConnectType,
        principal,
        account: principal2account(principal),
        creator: getActorCreatorByActiveProvider(provider),
        requestWhitelist: (() => {
            switch (connectType) {
                case 'plug':
                    return async (whitelist: string[]) =>
                        provider['ic'].requestConnect({ whitelist });
                case 'infinity':
                    return async (whitelist: string[]) =>
                        provider['ic'].requestConnect({ whitelist });
            }
            return async () => true;
        })(),
    };
    // console.warn('handle identity', last, next);
    handleIdentity(next).finally(callback);
};
