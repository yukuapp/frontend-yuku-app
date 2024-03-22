import { watchIdentityProfile } from '../interval/identity';
import { watchDevice } from './device';
import { watchScrollToTop } from './scroll';

export const watching = () => {
    watchScrollToTop();

    watchDevice();

    watchIdentityProfile();
};
