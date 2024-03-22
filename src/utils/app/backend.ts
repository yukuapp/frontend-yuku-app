import { SupportedBackend } from '@/types/app';
import { getBuildMode, getCommand } from './env';
import { BACKEND_TYPE, readStorage } from './storage';

// let backendType: SupportedBackend = 'production';
let backendType: SupportedBackend | undefined = undefined;

export const setBackendType = (backend: SupportedBackend) => (backendType = backend);

export const getBackendType = (): SupportedBackend => {
    if (backendType === undefined) throw new Error('backend type can not be undefined');
    return backendType;
};

export const getInitialBackendType = (): SupportedBackend => {
    const origin = location.origin;
    if (['https://yuku.app'].includes(origin)) {
        return 'production';
    }
    if (['https://test.yuku.app'].includes(origin)) {
        return 'test';
    }
    return 'production';
};

export const initBackendType = () => {
    const backendType = JSON.parse(
        readStorage(BACKEND_TYPE) ?? JSON.stringify(getInitialBackendType()),
    );
    setBackendType(backendType as SupportedBackend);

    console.debug(`>>>>> frontend: ${getBuildMode()} <<<<<`);
    console.debug(`>>>>> backend: ${backendType} <<<<<`);
    console.debug(`>>>>> command: ${getCommand()} <<<<<`);
};
