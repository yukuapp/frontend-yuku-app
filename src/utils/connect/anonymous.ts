import { createAnonymousIdentity } from '@/common/connect/creator';
import { ConnectedIdentity } from '@/types/identity';
import { getConnectHost } from '../app/env';

export const anonymous: ConnectedIdentity = createAnonymousIdentity(getConnectHost(), false);
