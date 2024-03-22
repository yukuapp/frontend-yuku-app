import { readLastConnectType } from '@/utils/app/storage';
import { LaunchpadCollectionInfo } from '@/canisters/yuku-old/yuku_launchpad';
import { SupportedBackend } from '@/types/app';
import { UserInfo } from '@/types/exchange/common';
import { getLarkUrl, getLarkUrlError } from '.';
import { sendLarkMessage } from './lark';

const send = (
    last: number,
    args: {
        env: SupportedBackend;
        id: string;
        action: string;
        message: string;
        user_info?: UserInfo;
    },
    url?: string,
): number => {
    const now = Date.now();
    sendLarkMessage(url ?? getLarkUrl(), {
        env: args.env,
        exchange: 'single-buy',
        user_info: args.user_info,
        id: args.id,
        action: args.action,
        timestamp: now,
        duration: last ? now - last : 0,
        message: args.message,
    });
    return now;
};

// start buy
export const larkNoticeLaunchpadBuyInitial = (
    env: SupportedBackend,
    id: string,
    principal: string,
    collection_info: LaunchpadCollectionInfo,
    count: number,
) => {
    send(0, {
        env,
        id,
        action: 'INITIAL',
        message: `purchaser: ${principal}
\tamount: ${count}
\tcollection_info: ${JSON.stringify(collection_info)}`,
        user_info: {
            wallet: readLastConnectType(),
            agent: navigator.userAgent,
        },
    });
};

export const larkNoticeLaunchpadBuyOver = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    collection_info: LaunchpadCollectionInfo,
    count: number,
    total_price: string,
    actions: string,
) => {
    setTimeout(() => {
        send(last, {
            env,
            id,
            action: 'OVER',
            message: `purchaser: ${principal}
\tamount: ${count}
\tcollection_info: ${JSON.stringify(collection_info)}
\ttotal_price: ${total_price}
\tactions: ${actions}`,
        });
    }, 1000);
};

export const larkNoticeLaunchpadBuy = (
    last: number,
    env: SupportedBackend,
    id: string,
    action: string,
    data?: string,
): number => {
    return send(last, {
        env,
        id,
        action,
        message: data ? `data: ${data}` : '',
    });
};

export const larkNoticeLaunchpadBuyFailed = (
    last: number,
    env: SupportedBackend,
    id: string,
    principal: string,
    collection_info: LaunchpadCollectionInfo,
    count: number,
    actions: string,
    error: string,
    log_error: boolean,
) => {
    setTimeout(() => {
        const args = {
            env,
            id,
            action: 'FAILED',
            message: `purchaser: ${principal}
\tamount: ${count}
\tcollection_info: ${JSON.stringify(collection_info)}
\tactions: ${actions}
\tError: ${error}`,
        };
        send(last, args);
        log_error && send(last, args, getLarkUrlError());
    }, 1000);
};
