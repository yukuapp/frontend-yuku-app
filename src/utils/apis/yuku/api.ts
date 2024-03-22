import * as api from '@/apis/yuku/api';
import {
    AIAvatarType,
    ConnectedResponse,
    CreateSpaceEvent,
    PlayerRoleAvatar,
    SpaceArgs,
    SpaceEvent,
    SpaceOpening,
    SpacePermission,
    UnityPackage,
    UserChainIdentity,
    UserMetadataView,
    UserSpace,
} from '@/apis/yuku/api';
import { getYukuAIAvatarApiHost, getYukuApiHost } from './special';

export const connectOrRegisterByPrincipal = async (args: {
    principal: string;
    random: string;
}): Promise<ConnectedResponse | undefined> => {
    const backend_host = getYukuApiHost();
    return api.connectOrRegisterByPrincipal(backend_host, args);
};

export const checkToken = async (args: {
    user_id: number;
    user_token: string;
}): Promise<ConnectedResponse | undefined> => {
    const backend_host = getYukuApiHost();
    return api.checkToken(backend_host, args);
};

export const changeUserMetadata = async (args: {
    params: { user_token: string; user_id: number };
    data: api.UserMetadataView;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.changeUserMetadata(backend_host, args);
};

export const queryUserMetadata = async (args: {
    id: string;
}): Promise<UserMetadataView | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryUserMetadata(backend_host, args);
};

export const querySpaceTemplates = async (): Promise<api.UnityPackage[] | undefined> => {
    const backend_host = getYukuApiHost();
    return api.querySpaceTemplates(backend_host);
};

export const createSpace = async (args: {
    params: { user_token: string; user_id: number };
    data: { title: string; description: string; template: UnityPackage };
}): Promise<number | undefined> => {
    const backend_host = getYukuApiHost();
    return api.createSpace(backend_host, args);
};

export const updateSpace = async (args: {
    params: { user_token: string; user_id: number; space_id: string };
    data: SpaceArgs;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.updateSpace(backend_host, args);
};

export const queryUserSpaces = async (args: {
    params: { user_id: number; user_token: string };
}): Promise<UserSpace[] | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryUserSpaces(backend_host, args);
};

export const deleteSpace = async (args: {
    params: { user_token: string; user_id: number };
    data: { id: number };
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.deleteSpace(backend_host, args);
};

export const queryUserAvatars = async (args: {
    user_id: number;
    user_token: string;
}): Promise<PlayerRoleAvatar[] | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryUserAvatars(backend_host, args);
};

export const changeUserAvatar = async (args: {
    user_token: string;
    user_id: number;
    player_role_id: number;
    player_role_avatar_index: number;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();

    return api.changeUserAvatar(backend_host, args);
};

export const queryUserSpaceEvent = async (args: {
    params: { user_id: number; user_token: string };
}): Promise<SpaceEvent[] | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryUserSpaceEvent(backend_host, args);
};

export const deleteSpaceEvent = async (args: {
    params: { user_token: string; user_id: number };
    data: { id: number };
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.deleteSpaceEvent(backend_host, args);
};

export const createSpaceEvent = async (args: {
    params: { user_token: string; user_id: number };
    data: CreateSpaceEvent;
}): Promise<string | undefined> => {
    const backend_host = getYukuApiHost();
    return api.createSpaceEvent(backend_host, args);
};

export const queryAllEvents = async (args: {
    page_number: number;
    page_size: number;
}): Promise<api.SpaceEventList | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryAllEvents(backend_host, args);
};

export const queryEventInfo = async (id: number): Promise<SpaceEvent | undefined> => {
    const backend_host = getYukuApiHost();
    return api.queryEventInfo(backend_host, id);
};

export const updateUserSpacePermission = async (args: {
    user_id: number;
    user_space_id: number;
    opening: SpaceOpening;
    permission: SpacePermission;
    user_token: string;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.updateUserSpacePermission(backend_host, args);
};

export const updateUserSpacePermissionWithPassword = async (args: {
    user_id: number;
    user_space_id: number;
    opening: SpaceOpening;
    permission: string;
    user_token: string;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.updateUserSpacePermissionWithPassword(backend_host, args);
};

export const updateUserSpacePermissionWithChainIdentity = async (args: {
    user_id: number;
    user_space_id: number;
    opening: SpaceOpening;
    permission: UserChainIdentity[];
    user_token: string;
}): Promise<boolean> => {
    const backend_host = getYukuApiHost();
    return api.updateUserSpacePermissionWithChainIdentity(backend_host, args);
};

export const accessUserSpace = async (args: {
    user_id: number;
    user_space_id: number;
    password?: string;
    user_token: string;
}): Promise<boolean | undefined> => {
    const backend_host = getYukuApiHost();
    return api.accessUserSpace(backend_host, args);
};

export const accessUserEvent = async (args: {
    user_id: number;
    user_event_id: number;
    password?: string;
    user_token: string;
}): Promise<boolean | undefined> => {
    const backend_host = getYukuApiHost();
    return api.accessUserEvent(backend_host, args);
};

export const checkUserRegistered = async (email: string): Promise<boolean | undefined> => {
    const backend_host = getYukuApiHost();
    return api.checkUserRegistered(backend_host, email);
};

export const sendCodeEmail = async (args: { email: string }): Promise<boolean | undefined> => {
    const backend_host = getYukuApiHost();
    const registered = await checkUserRegistered(args.email);
    return registered
        ? api.sendCodeEmailReset(backend_host, args)
        : api.sendCodeEmail(backend_host, args);
};

export const registerEmail = async (args: {
    email: string;
    password: string;
    code: string;
}): Promise<boolean | undefined> => {
    const backend_host = getYukuApiHost();
    const registered = await checkUserRegistered(args.email);
    return registered
        ? api.registerEmailReset(backend_host, args)
        : api.registerEmail(backend_host, args);
};

export const loginEmail = async (args: {
    email: string;
    password: string;
}): Promise<ConnectedResponse | undefined> => {
    const backend_host = getYukuApiHost();
    return api.loginEmail(backend_host, args);
};

export const generateIcWallet = async (args: {
    user_id: number;
    user_token: string;
}): Promise<string | undefined> => {
    const backend_host = getYukuApiHost();
    return api.generateIcWallet(backend_host, args);
};

export const sendActionEmailCode = async (args: {
    action: string;
    email: string;
    user_id: number;
    user_token: string;
    hash: string;
}) => {
    const backend_host = getYukuApiHost();
    return api.sendActionEmailCode(backend_host, args);
};

export const getEscrowICPBalance = async (args: { account: number; canister_id: string }) => {
    const backend_host = getYukuApiHost();
    return api.getEscrowICPBalance(backend_host, args);
};

export const getEscrowICPTransferFee = async (args: { canister_id: string }) => {
    const backend_host = getYukuApiHost();
    return api.getEscrowICPTransferFee(backend_host, args);
};

export const sendEscrowICP = async (args: {
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
}) => {
    const backend_host = getYukuApiHost();
    return api.sendEscrowICP(backend_host, args);
};

export const uploadFile2Web3Storage = async (args: {
    user_id: number;
    user_token: string;
    file: File;
}) => {
    const backend_host = getYukuApiHost();
    const r = await api.uploadFile2Web3Storage(backend_host, args);
    return r?.url;
};

export const queryAllAvatars = async (): Promise<AIAvatarType[] | undefined> => {
    const backend_host = getYukuAIAvatarApiHost();
    return api.queryAllAvatars(backend_host);
};
