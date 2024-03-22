import { produce } from 'immer';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import { devtools } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { checkToken, connectOrRegisterByPrincipal, queryUserMetadata } from '@/utils/apis/yuku/api';
import { isDevMode } from '@/utils/app/env';
import {
    readStorage,
    UNITY_USER_TOKEN,
    writeStorage,
    YUKU_USER_PERMISSIONS,
} from '@/utils/app/storage';
import { icpAccountBalance } from '@/utils/canisters/ledgers/icp';
import { ogyAccountBalance } from '@/utils/canisters/ledgers/ogy';
import { queryProfileByPrincipal, queryShoppingCart } from '@/utils/canisters/yuku-old/core';
import { queryCreditPointsByPrincipal } from '@/utils/canisters/yuku-old/credit_points';
import { generateJwtToken, queryJwtToken } from '@/utils/canisters/yuku-old/jwt_token';
import { queryRandomKey } from '@/utils/canisters/yuku/business';
import { UserMetadataView } from '@/apis/yuku/api';
import { cdn } from '@/common/cdn';
import { principal2account } from '@/common/ic/account';
import { parse_nft_identifier } from '@/common/nft/ext';
import { isSameNft, isSameNftByTokenId } from '@/common/nft/identifier';
import { Spend } from '@/common/react/spend';
import { refetch } from '@/common/tasks';
import { LedgerTokenBalance, SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';
import { ConnectedIdentity } from '@/types/identity';
import { NftIdentifier } from '@/types/nft';
import { BatchNftSale, ShoppingCartItem } from '@/types/yuku';

const isDev = isDevMode();

export type ProfilePermissions = 'Admin' | 'GameManager' | 'EventCreator';

type IdentityProfile = {
    yuku_token?: string;
    user_id?: number;
    principal?: string | undefined;
    account?: string;
    username: string;
    avatar: string;
    bio: string;
    social: { twitter: string; telegram: string; discord: string; email: string };
    permissions?: ProfilePermissions[];
};

type AddFundsArgs = { type: 'BUY' | 'SELL'; symbol: SupportedLedgerTokenSymbol; amount: string };

interface IdentityState {
    connectedIdentity?: ConnectedIdentity;
    setConnectedIdentity: (connectedIdentity?: ConnectedIdentity) => void;

    connecting: boolean;
    setConnecting: (c: boolean) => void;
    connect2YukuByPrincipal: () => Promise<string | undefined>;
    getYukuToken: () => { user_id: number; user_token: string } | undefined;
    getUserPermissions: () => ProfilePermissions[] | undefined;
    resetUnityUserToken: () => void;
    resetProfilePermissions: () => void;

    loadingProfile: boolean;
    identityProfile?: IdentityProfile;
    reloadIdentityProfile: (retry?: number) => Promise<void>;

    jwt_token?: string;
    reloadJwtToken: (retry?: number) => Promise<void>;

    // icp balance
    icpBalance?: LedgerTokenBalance;
    reloadIcpBalance: () => Promise<void>;
    // ogy balance
    ogyBalance?: LedgerTokenBalance;
    reloadOgyBalance: () => Promise<void>;
    // credit points
    creditPoints?: LedgerTokenBalance;
    reloadCreditPoints: () => Promise<void>;

    buyingNft: boolean;
    setBuyingNft: (buyingNft: boolean) => void;

    // favorites
    favorited?: NftIdentifier[];
    reloadFavorited: () => Promise<void>;
    addFavorited: (record: NftIdentifier) => void;
    removeFavorited: (record: NftIdentifier) => void;

    // batch sell
    showBatchSellSidebar: boolean;
    toggleShowBatchSellSidebar: () => void;
    batchSales: BatchNftSale[];
    updateBatchNftSale: (sale: BatchNftSale) => void;
    addBatchNftSale: (sale: BatchNftSale) => void;
    setBatchNftSales: (sale: BatchNftSale[] | undefined) => void;
    removeBatchNftSale: (token_id: NftIdentifier) => void;
    cleanBatchNftSales: () => void;

    // shopping cart
    showShoppingCart: boolean;
    toggleShowShoppingCart: () => void;
    // remote shopping cart
    shoppingCartFlag: number;
    shoppingCartItems?: ShoppingCartItem[];
    reloadShoppingCartItems: () => Promise<void>;
    updateShoppingCartItem: (item: ShoppingCartItem) => void;
    addShoppingCartItem: (item: ShoppingCartItem) => void;
    removeShoppingCartItem: (token: NftIdentifier) => void;
    cleanShoppingCartItems: () => void;

    reloadByIdentity: (identity: ConnectedIdentity) => Promise<void>;

    // user sidebar
    isUserSidebarOpen: boolean;
    toggleIsUserSidebarIdOpen: () => void;
    addFundsOpen: boolean;
    addFundsArgs?: AddFundsArgs;
    toggleAddFundsOpen: () => void;
    setAddFundArgs: (args: AddFundsArgs) => void;

    // market sweep

    sweepMode: boolean;
    toggleSweepMode: () => void;
    sweepGold: boolean;

    sweepItems: Record<string, ShoppingCartItem[]>;
    sweepGoldItems: ShoppingCartItem[];
    setSweepGold: (sweepGold: boolean) => void;
    setSweepItems: (items: ShoppingCartItem[], collection?: string, iGold?: boolean) => void;
    // updateSweepItems: (newItem: ShoppingCartItem) => void;
    // cleanSweepItems: () => void;
    // addSweepItems: (newItem: ShoppingCartItem) => void;
    // removeSweepItems: (token_id: NftIdentifier) => void;
}

const resetConnectedState = (connectedIdentity?: ConnectedIdentity): Partial<IdentityState> => {
    return {
        connectedIdentity,

        identityProfile: undefined,
        jwt_token: undefined,
        icpBalance: undefined,
        ogyBalance: undefined,
        creditPoints: undefined,
        buyingNft: false,
        favorited: undefined,
        showBatchSellSidebar: false,
        batchSales: [],
        showShoppingCart: false,
        shoppingCartFlag: 0,
        shoppingCartItems: undefined,
        isUserSidebarOpen: false,
    };
};

export const useIdentityStore = createWithEqualityFn<IdentityState>()(
    devtools(
        subscribeWithSelector<IdentityState>((set, get) => ({
            connectedIdentity: undefined,
            setConnectedIdentity: (connectedIdentity?: ConnectedIdentity) => {
                // console.warn('identity state connected', connectedIdentity);
                let delta: Partial<IdentityState> = {};
                if (connectedIdentity === undefined) {
                    delta = resetConnectedState(connectedIdentity);
                } else {
                    const { connectedIdentity: old } = get();
                    if (old === undefined) {
                        delta = resetConnectedState(connectedIdentity);
                    } else if (old.principal === connectedIdentity.principal) {
                        delta = { connectedIdentity };
                    } else {
                        delta = resetConnectedState(connectedIdentity);
                    }
                }
                console.debug('🚀 ~ connectedIdentity:', connectedIdentity);
                return set({ ...delta });
            },
            connecting: false,
            setConnecting: (c: boolean) => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                return set({ connecting: c });
            },

            getYukuToken: () => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                const value =
                    identity.connectType === 'email'
                        ? readStorage(`${UNITY_USER_TOKEN}${identity.main_email}`)
                        : readStorage(`${UNITY_USER_TOKEN}${identity.principal}`);
                if (!value) return;
                return JSON.parse(value);
            },
            getUserPermissions: () => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                const value =
                    identity.connectType === 'email'
                        ? readStorage(`${YUKU_USER_PERMISSIONS}${identity.main_email}`)
                        : readStorage(`${YUKU_USER_PERMISSIONS}${identity.principal}`);
                if (!value) return;
                return JSON.parse(value);
            },

            connect2YukuByPrincipal: async () => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                const token = get().getYukuToken();

                let correct = true;
                try {
                    if (token) {
                        const r = await checkToken({
                            user_id: token.user_id,
                            user_token: token.user_token,
                        });

                        writeStorage(
                            `${YUKU_USER_PERMISSIONS}${identity.principal}`,
                            JSON.stringify(r?.view.permissions || []),
                        );
                        correct = !!r;
                    } else {
                        correct = false;
                    }
                } catch (error) {
                    correct = false;
                }
                try {
                    if (correct) {
                        return;
                    }
                    set({ connecting: true });
                    const profile = await login2YukuByPrincipal(identity);
                    if (profile) {
                        writeStorage(
                            `${UNITY_USER_TOKEN}${identity.principal}`,
                            JSON.stringify({
                                user_id: profile.user_id,
                                user_token: profile.yuku_token,
                            }),
                        );

                        writeStorage(
                            `${YUKU_USER_PERMISSIONS}${identity.principal}`,
                            JSON.stringify(profile.permissions || []),
                        );
                    }
                    set({ identityProfile: profile });
                    return profile?.yuku_token;
                } catch (error) {
                    console.error(error);
                } finally {
                    set({ connecting: false });
                }
            },
            resetUnityUserToken: () => {
                const identity = get().connectedIdentity;
                if (!identity) return;

                identity.connectType === 'email'
                    ? writeStorage(`${UNITY_USER_TOKEN}${identity.main_email}`, '')
                    : writeStorage(`${UNITY_USER_TOKEN}${identity.principal}`, '');
            },
            resetProfilePermissions: () => {
                const identity = get().connectedIdentity;
                if (!identity) return;

                identity.connectType === 'email'
                    ? writeStorage(`${YUKU_USER_PERMISSIONS}${identity.main_email}`, '')
                    : writeStorage(`${YUKU_USER_PERMISSIONS}${identity.principal}`, '');
            },

            loadingProfile: false,
            identityProfile: undefined,
            reloadIdentityProfile: async (retry: number = 0) => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                set({ loadingProfile: true });
                try {
                    const view = await fetchIdentityProfile(identity, retry);
                    if (!view) {
                        return set(
                            produce((state: IdentityState) => {
                                state.identityProfile = {
                                    ...state.identityProfile,
                                    avatar: '/img/profile/default-avatar.png' || '',
                                    social: { twitter: '', telegram: '', discord: '', email: '' },
                                    username: '--',
                                    bio: '',
                                };
                            }),
                        );
                    }
                    return set(
                        produce((state: IdentityState) => {
                            state.identityProfile = {
                                ...state.identityProfile,
                                avatar:
                                    view.avatar === ''
                                        ? '/img/profile/default-avatar.png' ?? ''
                                        : view.avatar,
                                social: JSON.parse(view.social),
                                username: view.name,
                                bio: view.bio,
                            };
                        }),
                    );
                } catch (error) {
                    return set(
                        produce((state: IdentityState) => {
                            state.identityProfile = {
                                ...state.identityProfile,
                                avatar: '/img/profile/default-avatar.png' || '',
                                social: { twitter: '', telegram: '', discord: '', email: '' },
                                username: '--',
                                bio: '',
                            };
                        }),
                    );
                } finally {
                    set({ loadingProfile: false });
                }
            },

            jwt_token: undefined,
            reloadJwtToken: async (retry: number = 0) => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                return set({
                    jwt_token: await refetch(
                        () =>
                            new Promise((resolve, reject) => {
                                queryJwtToken(identity)
                                    .then(resolve)
                                    .catch(() => generateJwtToken(identity).then(resolve))
                                    .catch(reject);
                            }),
                        retry,
                    ),
                });
            },

            // icp balance
            icpBalance: undefined,
            reloadIcpBalance: async () => {
                const identity = get().connectedIdentity;
                if (!identity?.account) return;
                const icpBalance = await refetch(() => icpAccountBalance(identity.account!));
                return set({ icpBalance });
            },
            // ogy balance
            ogyBalance: undefined,
            reloadOgyBalance: async () => {
                const identity = get().connectedIdentity;
                if (!identity?.account) return;
                const ogyBalance = await refetch(() => ogyAccountBalance(identity.account!));
                return set({ ogyBalance });
            },
            // credit points
            creditPoints: undefined,
            reloadCreditPoints: async () => {
                const identity = get().connectedIdentity;
                if (!identity?.principal) return;
                const creditPoints = await refetch(() =>
                    queryCreditPointsByPrincipal(identity.principal!),
                );
                return set({ creditPoints });
            },

            buyingNft: false,
            setBuyingNft: (buyingNft: boolean) => set({ buyingNft }),

            // favorites
            favorited: undefined,
            reloadFavorited: async () => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                const favorited = await fetchUserFavorited(identity);
                return set({ favorited });
            },
            addFavorited: (record: NftIdentifier) => {
                return set(
                    produce((state: IdentityState) => {
                        const old = state.favorited;
                        if (old === undefined) return;
                        const favorited = old.filter((n) => !isSameNft(n, record));
                        favorited.push(record);
                        state.favorited = favorited;
                    }),
                );
            },
            removeFavorited: (record: NftIdentifier) => {
                const { favorited: old } = get();
                if (old === undefined) return;
                const favorited = old.filter((n) => !isSameNft(n, record));
                return set({ favorited });
            },

            // batch sell
            showBatchSellSidebar: false,
            toggleShowBatchSellSidebar: () =>
                set({ showBatchSellSidebar: !get().showBatchSellSidebar }),
            batchSales: [],
            updateBatchNftSale: (sale: BatchNftSale) => {
                return set(
                    produce((state: IdentityState) => {
                        const item = state.batchSales.find((o) => isSameNftByTokenId(o, sale));
                        if (item === undefined) return;
                        item.token = sale.token;
                        item.last = sale.last;
                        item.price = sale.price;
                        item.result = sale.result;
                    }),
                );
            },
            addBatchNftSale: (sale: BatchNftSale) => {
                const { batchSales: old } = get();
                const item = old.find((o) => isSameNftByTokenId(o, sale));
                if (item !== undefined) return;
                return set(
                    produce((state: IdentityState) => {
                        state.batchSales.push(sale);
                    }),
                );
            },
            setBatchNftSales: (sales: BatchNftSale[] | undefined) => {
                if (!sales) {
                    return;
                }
                return set({ batchSales: sales });
            },
            removeBatchNftSale: (token_id: NftIdentifier) => {
                const { batchSales: old } = get();
                const records = old.filter((o) => !isSameNft(o.token_id, token_id));
                if (records.length === old.length) return;
                return set({ batchSales: records });
            },
            cleanBatchNftSales: () => set({ batchSales: [] }),

            // shopping cart
            showShoppingCart: false,
            toggleShowShoppingCart: () => set({ showShoppingCart: !get().showShoppingCart }),

            // remote shopping cart
            shoppingCartFlag: 0,
            shoppingCartItems: undefined,
            reloadShoppingCartItems: async () => {
                const identity = get().connectedIdentity;
                if (!identity) return;
                const shoppingCartItems = await fetchShoppingCart(identity);
                console.debug(
                    '🚀 ~ reloadShoppingCartItems: ~ shoppingCartItems:',
                    shoppingCartItems,
                );
                return set({
                    shoppingCartItems,
                    shoppingCartFlag: get().shoppingCartFlag + 1,
                });
            },
            updateShoppingCartItem: (newItem: ShoppingCartItem) => {
                return set(
                    produce((state: IdentityState) => {
                        const old = state.shoppingCartItems;
                        if (old === undefined) return;
                        const item = old.find((o) => isSameNftByTokenId(o, newItem));
                        if (item === undefined) return;
                        item.card = newItem.card;
                        item.listing = newItem.listing;
                        state.shoppingCartFlag++;
                    }),
                );
            },
            addShoppingCartItem: (newItem: ShoppingCartItem) => {
                return set(
                    produce((state: IdentityState) => {
                        const old = state.shoppingCartItems;
                        if (old === undefined) return;
                        const item = old.find((o) => isSameNftByTokenId(o, newItem));
                        if (item !== undefined) return;
                        old.push(newItem);
                        state.shoppingCartFlag++;
                    }),
                );
            },
            removeShoppingCartItem: (token_id: NftIdentifier) => {
                const { shoppingCartItems: old } = get();
                if (old === undefined) return;
                const records = old.filter((o) => !isSameNft(o.token_id, token_id));
                if (records.length === old.length) return;
                return set({
                    shoppingCartItems: records,
                    shoppingCartFlag: get().shoppingCartFlag + 1,
                });
            },
            cleanShoppingCartItems: () =>
                set({ shoppingCartItems: [], shoppingCartFlag: get().shoppingCartFlag + 1 }),
            reloadByIdentity: async (identity: ConnectedIdentity) => {
                const { connectedIdentity: old } = get();
                if (old === undefined) return;
                if (old !== identity) return;
                if (!identity.account || !identity.principal) {
                    return;
                }
                // console.debug('connected identity reload start');
                const spend = Spend.start(`connected identity reload by identity end`);
                const [icpBalance, ogyBalance, creditPoints] = await Promise.all([
                    refetch(() => icpAccountBalance(identity.account!)),
                    refetch(() => ogyAccountBalance(identity.account!)),
                    refetch(() => queryCreditPointsByPrincipal(identity.principal!)),
                ]);
                spend.mark('over');

                return set({
                    icpBalance,
                    ogyBalance,
                    creditPoints,
                });
            },

            // user sidebar
            isUserSidebarOpen: false,
            toggleIsUserSidebarIdOpen: () => set({ isUserSidebarOpen: !get().isUserSidebarOpen }),
            addFundsOpen: false,
            toggleAddFundsOpen: () => set({ addFundsOpen: !get().addFundsOpen }),
            setAddFundArgs: (args: AddFundsArgs) => set({ addFundsArgs: args }),
            // market sweep
            sweepMode: false,
            sweepGold: false,
            sweepItems: {},
            sweepGoldItems: [],
            setSweepGold: (sweepGold: boolean) => set({ sweepGold }),
            toggleSweepMode: () => set({ sweepMode: !get().sweepMode }),
            setSweepItems: (items: ShoppingCartItem[], collection?: string, iGold?: boolean) => {
                const { sweepItems: old } = get();
                iGold
                    ? set({ sweepGoldItems: items })
                    : collection && set({ sweepItems: { ...old, [collection]: items } });
            },
        })),
        {
            enabled: isDev,
            name: 'IdentityStore',
        },
    ),
    shallow,
);

isDev && mountStoreDevtool('IdentityStore', useIdentityStore);

const login2YukuByPrincipal = async function (
    connectedIdentity: ConnectedIdentity,
): Promise<IdentityProfile | undefined> {
    if (!connectedIdentity?.principal) {
        return;
    }
    const random = await queryRandomKey(connectedIdentity);
    const user_info = await connectOrRegisterByPrincipal({
        principal: connectedIdentity.principal,
        random,
    });
    if (!user_info) {
        return;
    }
    const parsed_social = JSON.parse(user_info.view.metadata.social);
    return {
        yuku_token: user_info.token,
        user_id: user_info.user_id,
        principal: connectedIdentity.principal,
        account: principal2account(connectedIdentity.principal),
        email: user_info.view.email_list[0],
        username: user_info.view.metadata.name,
        avatar:
            user_info.view.metadata.avatar === ''
                ? '/img/profile/default-avatar.png'
                : cdn(user_info.view.metadata.avatar),

        bio: user_info.view.metadata.bio,
        social: parsed_social,
        permissions: user_info.view.permissions,
    } as IdentityProfile;
};

export const throwIdentity = (connectedIdentity: ConnectedIdentity | undefined) => {
    if (connectedIdentity?.connectType === 'email') {
        throw new Error('login with email cant trade on yuku!');
    }
};

const fetchIdentityProfile = async (
    connectedIdentity: ConnectedIdentity,
    retry: number,
): Promise<UserMetadataView | undefined> => {
    const profile = await refetch(
        () =>
            queryUserMetadata({
                id:
                    connectedIdentity?.principal ??
                    connectedIdentity?.account ??
                    (connectedIdentity.connectType === 'email' && connectedIdentity.user_id),
            }),
        retry,
    );
    return profile;
};

const fetchUserFavorited = async (
    connectedIdentity: ConnectedIdentity,
): Promise<NftIdentifier[] | undefined> => {
    if (!connectedIdentity.principal) {
        return;
    }
    try {
        const d = await queryProfileByPrincipal(connectedIdentity.principal);
        return d.favorited.map(parse_nft_identifier);
    } catch (e) {
        console.log(`🚀 ~ file: identity.ts:202 ~ e:`, e);
        return undefined;
    }
};

const fetchShoppingCart = async (
    connectedIdentity: ConnectedIdentity,
): Promise<ShoppingCartItem[] | undefined> => {
    try {
        const d = await queryShoppingCart(connectedIdentity);
        return d.map((token_id) => ({ token_id }));
    } catch (e) {
        console.debug(`🚀 ~ file: identity.ts:213 ~ e:`, e);
        return undefined;
    }
};
