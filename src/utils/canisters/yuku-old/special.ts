import { findSpecialCanisters, SpecialCanisters } from '@/canisters/yuku-old/special';
import { getBackendType } from '../../app/backend';
import { getBuildMode } from '../../app/env';

const findCanisters = (): SpecialCanisters =>
    findSpecialCanisters(getBuildMode(), getBackendType());

export const getYukuCoreCanisterId = (): string => findCanisters().yuku_core;
export const getYukuCreditPointsCanisterId = (): string => findCanisters().yuku_credit_points;
export const getYukuArtistRouterCanisterId = (): string => findCanisters().yuku_artist_router;
export const getYukuUserRecordCanisterId = (): string => findCanisters().yuku_user_record;
export const getYukuOrigynArtCanisterId = (): string => findCanisters().yuku_origyn_art;
export const getYukuOrigynArtProposalCanisterId = (): string =>
    findCanisters().yuku_origyn_art_proposal;
export const getYukuCccProxyCanisterId = (): string => findCanisters().yuku_ccc_proxy;
export const getYukuLaunchpadCanisterId = (): string => findCanisters().yuku_launchpad;
export const getYukuApplicationCanisterId = (): string => findCanisters().yuku_application;
export const getYukuOatCanisterId = (): string => findCanisters().yuku_oat;
export const getYukuShikuLandsCollection = (): string => findCanisters().yuku_shiku_lands;
export const getYukuJwtTokenCanisterId = (): string => findCanisters().yuku_jwt_token;
