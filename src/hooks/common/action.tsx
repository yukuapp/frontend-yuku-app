import { useCallback } from 'react';
import { useMessage } from './message';

export const useCheckAction = (): ((action: string | undefined, tips: string) => void) => {
    const message = useMessage();

    const checkAction = useCallback(
        (action: string | undefined, tips: string) => {
            if (action !== undefined) {
                message.warning(tips);
                throw new Error(`already executing`);
            }
        },
        [message],
    );

    return checkAction;
};
