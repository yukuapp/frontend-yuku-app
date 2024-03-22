import { findYukuSpecialHosts, YukuSpecialHosts } from '@/apis/yuku/special';
import { getBackendType } from '../../app/backend';
import { getBuildMode } from '../../app/env';

const findHosts = (): YukuSpecialHosts => findYukuSpecialHosts(getBuildMode(), getBackendType());

export const getYukuApiHost = (): string => findHosts().yuku_api;
export const getYukuSpaceHost = (): string => findHosts().space_host;
export const getYukuDataHost = (): string => findHosts().yuku_data_api;
export const getYukuAlchemyHost = (): string => findHosts().yuku_alchemy_host;
export const getYukuAIAvatarApiHost = (): string => findHosts().ai_avatar_api;
export const getYukuAIAvatarHost = (): string => findHosts().ai_avatar_host;
