import dayjs from 'dayjs';
import { SupportedBackend } from '@/types/app';
import { UserInfo } from '@/types/exchange/common';

// Need to queue message sending, do not mess up
type LarkMessage = {
    url: string;
    body: string;
};

const messages: LarkMessage[] = [];
let last = 0;
const SEND_DURATION = 1000; // Send 1 message per second

const send = () => {
    if (messages.length === 0) return;
    const now = Date.now();
    if (now < last + SEND_DURATION) return setTimeout(send, SEND_DURATION);
    last = now; // Update time
    const lark_message = messages.splice(0, 1)[0]; // Take one
    fetch(lark_message.url, {
        method: 'POST',
        headers: [['Content-Type', 'application/json']],
        body: lark_message.body,
    }).catch((e) => console.debug('🚀 ~ file: lark.ts:25 ~ send ~ e:', e));

    setTimeout(send, SEND_DURATION);
};

export const sendLarkMessage = (
    url: string,
    args: {
        env: SupportedBackend;
        exchange: 'single-buy' | 'single-sell' | 'single-transfer' | 'batch-buy' | 'batch-sell';
        id: string;
        action: string;
        timestamp: number;
        duration: number; // 0 means no time range
        message: string;
        user_info?: UserInfo;
    },
) => {
    const message = `Env: ${args.env}
Ex: ${args.exchange}
Id: ${args.id}
Action: ${args.action}${args.duration ? ` over` : ''}
Timestamp: ${dayjs(new Date(args.timestamp)).format('YY-MM-DD HH:mm:ss.SSS')}${
        args.duration ? `\nSpend: ${args.duration}ms` : ''
    }${args.user_info ? '\nUserinfo: ' + JSON.stringify(args.user_info) : ''}${
        args.message ? `\nMsg: ${args.message}` : ''
    }`;

    // If there is a notification address, send the request
    if (url) {
        messages.push({
            url,
            body: JSON.stringify({ msg_type: 'text', content: { text: message } }),
        });
        send();
    }
};
