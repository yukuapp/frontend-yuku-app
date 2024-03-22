import { findSpecialCanisters, SpecialYukuCanisters } from '@/canisters/yuku/special';
import { getBackendType } from '../../app/backend';
import { getBuildMode } from '../../app/env';

const findCanisters = (): SpecialYukuCanisters =>
    findSpecialCanisters(getBuildMode(), getBackendType());
export const getYukuBusinessCanisterId = (): string => findCanisters().yuku_business;
