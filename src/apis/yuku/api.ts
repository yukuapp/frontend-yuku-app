import { isDevMode } from '@/utils/app/env';
import { isAccountHex } from '@/common/ic/account';
import { isPrincipalText } from '@/common/ic/principals';

// import { isAccountHex } from '@/common/ic/account';
// import { isPrincipalText } from '@/common/ic/principals';

export type UserMetadataView = {
    name: string;
    avatar: string;
    bio: string;
    // Media link
    social: string; // json
};

export type InternetComputerNetwork = 'Ic';
export type BitcoinNetwork = 'Mainnet' | 'Testnet';

export type UserChainIdentity =
    | {
          InternetComputer: {
              network: InternetComputerNetwork;
              principal: string;
          };
      }
    | {
          Ethereum: {
              chain_id: number;
              address: string;
          };
      }
    | {
          Bitcoin: {
              network: BitcoinNetwork;
              address: string;
          };
      }
    | {
          EscrowInternetComputer: {
              network: InternetComputerNetwork;
              principal: string;

              hash: string;
          };
      };

export type UserView = {
    metadata: UserMetadataView;
    // User's bound email
    email_list: string[];
    // User's bound identities
    identity_list: UserChainIdentity[];
    // User's permissions
    permissions: ('Admin' | 'GameManager' | 'EventCreator')[];
};

export type ConnectedResponse = {
    user_id: number;
    token: string;
    view: UserView;
};

// Space template
export type UnityPackage = {
    id: number;
    created: number;
    updated: number;

    user_id: number;

    sku: string;

    url: string;
    package_url: string;
    package_type: 'SpaceTemplate';
    package_thumbnail: string;
    package_name: string;

    official: boolean;
};

export type SpaceOpening = {
    start?: number;
    end?: number;
};

export type Chain =
    | {
          InternetComputer: { network: InternetComputerNetwork };
      }
    | {
          Ethereum: { chain_id: number };
      }
    | {
          Bitcoin: { network: BitcoinNetwork };
      };

export type ChainTokenBalance = {
    chain: Chain;
    min_balance: number;
};

export type ChainNftOwner = {
    chain: Chain;
    address: String;
    token_id?: string; // Any id or specified id
};

export type SpacePermissionItem =
    | {
          Password: string;
      }
    | {
          ChainIdentity: UserChainIdentity;
      }
    | {
          ChainTokenBalance: ChainTokenBalance;
      }
    | {
          ChainNftOwner: ChainNftOwner;
      }
    | {
          UserIdentity: number;
      };

export type SpacePermission =
    | 'None'
    | { Required: SpacePermissionItem }
    | { Rejected: SpacePermissionItem }
    | { All: SpacePermission[] }
    | { Any: SpacePermission[] }
    | { Not: SpacePermission[] };

// Space
export type UserSpace = {
    id: number;
    created: number;
    updated: number;

    user_id: number;
    unity_package_id: number;

    scene_type: number;
    scene_map: string;
    title: string;
    description: string;
    scene_json: string;
    scene_thumbnail: string;

    state: 'init' | 'submitted' | 'approved' | 'rejected';

    saw: number;
    // share_id: string; // Not returned

    opening: SpaceOpening;
    permission: SpacePermission;

    review_desc: string;
    review_reply: string;
    review_at: number;
    review_user_id: number;

    unity_package: UnityPackage;
    share_url: string; // Share link
};

export type SpeakMode = 'Freedom' | { Assign: number[] };
// Event
export type SpaceEvent = {
    id: number;
    created: number;
    updated: number;

    user_id: number;
    user_space_id: number;

    saw: number;
    // share_id: string; // Not returned

    host_list: number[];
    opening: SpaceOpening;
    permission: SpacePermission;
    speak_mode: SpeakMode;

    active: boolean;

    title: string;
    description: string;
    cover_image: string;

    share_url: string; // Share link
};

export type PageDate<T> = {
    page_number: number;
    page_size: number;
    total: number;
    list: T[];
};

// Event list
export type SpaceEventList = PageDate<SpaceEvent>;

// avatar
export type PlayerRoleAvatar = {
    created: number;
    updated: number;

    role_id: number;
    index: number;
    chosen: boolean;

    avatar_type: number;
    model_url: string;
    avatar_url: string;
    data: string;
};

const getYukuFetch = () =>
    (window as any).yukuFetch as <T>(input: string, init?: RequestInit) => Promise<T | undefined>;

// Connect or register yuku with principal
export const connectOrRegisterByPrincipal = async (
    backend_host: string,
    args: {
        principal: string;
        random: string;
    },
): Promise<ConnectedResponse | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<ConnectedResponse>(`${backend_host}/user/chain/ic/connect_or_register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return r;
};

// Check user token
export const checkToken = async (
    backend_host: string,
    args: { user_id: number; user_token: string },
): Promise<ConnectedResponse | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<ConnectedResponse>(`${backend_host}/user/${args.user_id}/token`, {
        headers: {
            'X-Token': args.user_token,
        },
    });
    return r;
};

// Query user information
export const queryUserMetadata = async (
    backend_host: string,
    args: { id: string }, // pid account name or user id
): Promise<UserMetadataView | undefined> => {
    const fetch = getYukuFetch();
    if (isPrincipalText(args.id) || isAccountHex(args.id)) {
        const r = (await fetch)<UserMetadataView>(
            `${backend_host}/user/chain/ic/${args.id}/metadata`,
        );
        return r;
    }
    const r = await fetch<UserMetadataView>(`${backend_host}/user/${args.id}/metadata`);
    return r;
};

// Modify user information
export const changeUserMetadata = async (
    backend_host: string,
    args: {
        params: { user_token: string; user_id: number };
        data: UserMetadataView;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(`${backend_host}/user/${args.params.user_id}/metadata`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Token': args.params.user_token,
        },
        body: JSON.stringify(args.data),
    });
    return true;
};

// Get all available space templates
export const querySpaceTemplates = async (
    backend_host: string,
): Promise<UnityPackage[] | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<UnityPackage[]>(`${backend_host}/space/unity_package/official`);
    return r;
};

// ================================= Create Space with a Specific Template =================================
export const createSpace = async (
    backend_host: string,
    args: {
        params: { user_token: string; user_id: number };
        data: { title: string; description: string; template: UnityPackage };
    },
): Promise<number | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<number>(`${backend_host}/space/user/${args.params.user_id}/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Token': args.params.user_token,
        },
        body: JSON.stringify({
            sku: args.data.template.sku,

            scene_type: 3, // Default scene type is 3
            scene_map: args.data.template.package_type,
            title: args.data.title,
            description: args.data.description,
            scene_json: JSON.stringify({
                title: args.data.title,
                description: args.data.description,
            }),
            scene_thumbnail: args.data.template.package_thumbnail,
        }),
    });
    return r;
};
// ================================= Update Space Information =================================
export type SpaceArgs = {
    sku: string;

    scene_type: number;
    scene_map: string;
    title: string;
    description: string;
    scene_json: string;
    scene_thumbnail: string;
};
export const updateSpace = async (
    backend_host: string,
    args: {
        params: { user_token: string; user_id: number; space_id: string };
        data: SpaceArgs;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.params.user_id}/space/${args.params.space_id}/update`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.params.user_token,
            },
            body: JSON.stringify(args.data),
        },
    );
    return true;
};

// ================================= Get User Space List =================================
export const queryUserSpaces = async (
    backend_host: string,
    args: { params: { user_id: number; user_token: string } },
): Promise<UserSpace[] | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<UserSpace[]>(`${backend_host}/space/user/${args.params.user_id}/all`, {
        headers: { 'X-Token': args.params.user_token },
    });
    return r;
};

// ================================= Delete Space =================================
export const deleteSpace = async (
    backend_host: string,
    args: { params: { user_token: string; user_id: number }; data: { id: number } },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.params.user_id}/space/${args.data.id}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.params.user_token,
            },
        },
    );
    return true;
};

// ================================= Get User Avatar List =================================
export const queryUserAvatars = async (
    backend_host: string,
    args: { user_id: number; user_token: string },
): Promise<PlayerRoleAvatar[] | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<PlayerRoleAvatar[]>(`${backend_host}/player/${args.user_id}/avatars`, {
        headers: {
            'Content-Type': 'application/json',
            'X-Token': args.user_token,
        },
    });

    return r;
};

// ================================= Set User Avatar =================================
export const changeUserAvatar = async (
    backend_host: string,
    args: {
        user_id: number;
        user_token: string;
        player_role_id: number;
        player_role_avatar_index: number;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/player/${args.user_id}/role/${args.player_role_id}/avatar/${args.player_role_avatar_index}/choose`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
        },
    );

    return true;
};

// ================================= Get User Space Event List =================================
export const queryUserSpaceEvent = async (
    backend_host: string,
    args: { params: { user_id: number; user_token: string } },
): Promise<SpaceEvent[] | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<SpaceEvent[]>(
        `${backend_host}/space/event/user/${args.params.user_id}/all`,
        {
            headers: { 'X-Token': args.params.user_token },
        },
    );
    return r;
};

// ================================= Delete Event =================================
export const deleteSpaceEvent = async (
    backend_host: string,
    args: { params: { user_token: string; user_id: number }; data: { id: number } },
): Promise<boolean> => {
    await fetch(`${backend_host}/space/event/user/${args.params.user_id}/event/${args.data.id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-Token': args.params.user_token,
        },
    });
    return true;
};

// ================================= Create Event =================================
export type CreateSpaceEvent = {
    host_list: number[];
    opening: SpaceOpening;
    permission: SpacePermission;
    speak_mode: SpeakMode;
    title: string;
    event_class: string;
    description: string;
    cover_image: string;
    user_space_id: number;
};

export const createSpaceEvent = async (
    backend_host: string,
    args: {
        params: { user_token: string; user_id: number };
        data: CreateSpaceEvent;
    },
): Promise<string | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(
        `${backend_host}/space/event/user/${args.params.user_id}/create`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.params.user_token,
            },
            body: JSON.stringify(args.data),
        },
    );
    return r;
};

// ================================= Modify UserSpace Permission Parameters =================================
export const updateUserSpacePermission = async (
    backend_host: string,
    args: {
        user_id: number;
        user_space_id: number;
        opening: SpaceOpening;
        permission: SpacePermission;
        user_token: string;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.user_id}/space/${args.user_space_id}/update/access`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                opening: args.opening,
                permission: args.permission,
            }),
        },
    );
    return true;
};
export const updateUserSpacePermissionWithChainIdentity = async (
    backend_host: string,
    args: {
        user_id: number;
        user_space_id: number;
        opening: SpaceOpening;
        permission: UserChainIdentity[];
        user_token: string;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.user_id}/space/${args.user_space_id}/update/access/with/chain_identity`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                opening: args.opening,
                permission: args.permission,
            }),
        },
    );
    return true;
};
export const updateUserSpacePermissionWithPassword = async (
    backend_host: string,
    args: {
        user_id: number;
        user_space_id: number;
        opening: SpaceOpening;
        permission: string;
        user_token: string;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.user_id}/space/${args.user_space_id}/update/access/with/password`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                opening: args.opening,
                permission: args.permission,
            }),
        },
    );
    return true;
};
export const updateUserSpacePermissionWithUserIdentity = async (
    backend_host: string,
    args: {
        user_id: number;
        user_space_id: number;
        opening: SpaceOpening;
        permission: number[];
        user_token: string;
    },
): Promise<boolean> => {
    const fetch = getYukuFetch();
    await fetch<undefined>(
        `${backend_host}/space/user/${args.user_id}/space/${args.user_space_id}/update/access/with/user_identity`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                opening: args.opening,
                permission: args.permission,
            }),
        },
    );
    return true;
};

// ================================= Verify if the Current User has Access to UserSpace =================================
const hasPermissionItemPassword = (item: SpacePermissionItem): boolean => {
    return item['Password'] != undefined;
};
const hasPermissionItemChainNftOwner = (item: SpacePermissionItem): string | undefined => {
    return item['ChainNftOwner']?.address;
};
const hasPermissionItemChainIdentity = (item: SpacePermissionItem): boolean => {
    return item['ChainIdentity'] != undefined;
};
export const hasPermissionPassword = (permission: SpacePermission): boolean => {
    if (permission === 'None') return false;
    if (permission['Required']) return hasPermissionItemPassword(permission['Required']);
    if (permission['Rejected']) return hasPermissionItemPassword(permission['Rejected']);
    const items: SpacePermissionItem[] =
        permission['All'] ?? permission['Any'] ?? permission['Not'];
    for (const item of items) {
        if (hasPermissionItemPassword(item)) return true;
    }
    return false;
};
export const hasPermissionChainNftOwner = (permission: SpacePermission): string | undefined => {
    if (permission === 'None') return undefined;
    if (permission['Required']) return hasPermissionItemChainNftOwner(permission['Required']);
    if (permission['Rejected']) return hasPermissionItemChainNftOwner(permission['Rejected']);
    return undefined;
};
export const hasPermissionChainIdentity = (permission: SpacePermission): boolean => {
    if (permission === 'None') return false;
    if (permission['Required']) return hasPermissionItemChainIdentity(permission['Required']);
    if (permission['Rejected']) return hasPermissionItemChainIdentity(permission['Rejected']);
    const items: SpacePermission[] = permission['All'] ?? permission['Any'] ?? permission['Not'];
    for (const item of items) {
        if (hasPermissionChainIdentity(item)) return true;
    }
    return false;
};
// ! Steps to Verify Permissions
// 1. Call the accessUserSpace interface without password parameters. If it returns true, proceed.
// 2. Call hasPermissionPassword to check if a password is required. If false, display "No access permission".
// 3. Prompt the user to enter the password and call the accessUserSpace interface again. If it returns false, the password is incorrect.

export const accessUserSpace = async (
    backend_host: string,
    args: {
        user_id: number;
        user_space_id: number;
        password?: string;
        user_token: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(
        `${backend_host}/space/user/${args.user_id}/space/${args.user_space_id}/access`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                password: args.password,
            }),
        },
    );

    return r === null ? false : r;
};

export const accessUserEvent = async (
    backend_host: string,
    args: {
        user_id: number;
        user_event_id: number;
        password?: string;
        user_token: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(
        `${backend_host}/space/event/user/${args.user_id}/event/${args.user_event_id}/access`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify({
                password: args.password,
            }),
        },
    );
    return !!r;
};

// ================================= Get All Events =================================

export const queryAllEvents = async (
    backend_host: string,
    args: {
        page_number: number;
        page_size: number;
    },
): Promise<SpaceEventList | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<SpaceEventList>(
        `${backend_host}/space/event/all?page_size=${args.page_size}&page_number=${args.page_number}`,
    );
    return r;
};

// ================================= Get Event Information =================================
export const queryEventInfo = async (
    backend_host: string,
    id: number,
): Promise<SpaceEvent | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<SpaceEvent>(`${backend_host}/space/event/${id}`);
    return r;
};

// ================================= Check if Email is Registered =================================
export const checkUserRegistered = async (
    backend_host: string,
    email: string,
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(`${backend_host}/user/email/register/validate?email=${email}`);
    return !r;
};

// ================================= Send Verification Code =================================
export const sendCodeEmail = async (
    backend_host: string,
    args: {
        email: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(`${backend_host}/user/email/register/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: args.email,
        }),
    });
    return !r;
};
// Send code to reset password
export const sendCodeEmailReset = async (
    backend_host: string,
    args: {
        email: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(`${backend_host}/user/email/reset/password/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return !r;
};

// ================================= Register Email =================================
export const registerEmail = async (
    backend_host: string,
    args: {
        email: string;
        password: string;
        code: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(`${backend_host}/user/email/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return !r;
};

// ================================= Reset Email =================================
export const registerEmailReset = async (
    backend_host: string,
    args: {
        email: string;
        password: string;
        code: string;
    },
): Promise<boolean | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<boolean>(`${backend_host}/user/email/reset/password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return !r;
};
// ================================= Login Email =================================
export const loginEmail = async (
    backend_host: string,
    args: {
        email: string;
        password: string;
    },
): Promise<ConnectedResponse | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<ConnectedResponse>(`${backend_host}/user/email/password/connect`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return r;
};

// ================================= Login Email and Generate IC Wallet =================================

export const generateIcWallet = async (
    backend_host: string,
    args: { user_id: number; user_token: string },
): Promise<string | undefined> => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(`${backend_host}/user/${args.user_id}/chain/ic/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Token': args.user_token,
        },
        body: JSON.stringify(args),
    });
    return r;
};

// ================================= Get Escrow ICP Balance =================================
export const getEscrowICPBalance = async (
    backend_host: string,
    args: { account: number; canister_id: string },
) => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(`${backend_host}/user/chain/ic/token/balance/ledger`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return r;
};

// ================================= Send Email Verification Code for Action =================================
export const sendActionEmailCode = async (
    backend_host: string,
    args: {
        action: string;
        email: string;
        user_id: number;
        user_token: string;
        hash: string;
    },
) => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(
        `${backend_host}/user/${args.user_id}/chain/ic/${args.hash}/send`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify(args),
        },
    );
    return r;
};
// ================================= Get Escrow ICP Transfer Fee =================================
export const getEscrowICPTransferFee = async (
    backend_host: string,
    args: { canister_id: string },
) => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(`${backend_host}/user/chain/ic/token/fee/ledger`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
    });
    return r;
};
// ================================= Send ICP from Escrow Wallet =================================
export const sendEscrowICP = async (
    backend_host: string,
    args: {
        action: string;
        email: string;
        amount: string;
        canister_id: string;
        code: string;
        fee: string;
        to: string;
        user_id: number;
        user_token: string;
        hash: string;
    },
) => {
    const fetch = getYukuFetch();
    const r = await fetch<string>(
        `${backend_host}/user/${args.user_id}/chain/ic/${args.hash}/token/transfer/ledger`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Token': args.user_token,
            },
            body: JSON.stringify(args),
        },
    );
    return r;
};

// ================================= Upload File to Web3Storage =================================
export const uploadFile2Web3Storage = async (
    backend_host: string,
    args: { user_id: number; user_token: string; file: File },
) => {
    const fetch = getYukuFetch();
    const formData = new FormData();
    formData.append('content_type', args.file.type);
    formData.append('file_name', args.file.name);
    formData.append('memo', isDevMode() ? 'test' : 'production');
    formData.append('metadata', isDevMode() ? 'test' : 'production');
    formData.append('service_type', 'Web3Storage');
    formData.append('file', args.file);
    const r = await fetch<{ url: string }>(
        `${backend_host}/system/upload_file/user/${args.user_id}/upload_file`,
        {
            method: 'POST',
            headers: {
                'X-Token': args.user_token,
            },
            body: formData,
        },
    );
    return r;
};

// ============================== Query All Avatars ==============================
export type AIAvatarType = {
    avatar_url: string;
    backgroud_url?: string;
    description?: string;
    gender?: string;
    greeting: string;
    id_3DAvatar: string;
    name: string;
    short_description: string;
    voice?: string;
    _id: string;
};

export const queryAllAvatars = async (
    backend_host: string,
): Promise<AIAvatarType[] | undefined> => {
    const r = await fetch(`${backend_host}/api/avatars`);
    const json = await r.json();
    return json ? json.data : [];
};
