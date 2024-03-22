import message from '@/components/message';
import { useIdentityStore } from '@/stores/identity';
import { YukuResponse } from '@/types/yuku';

let reconnect_times = 0;
export const useInterceptors = () => {
    const connect2YukuByPrincipal = useIdentityStore((s) => s.connect2YukuByPrincipal);

    const yukuInterceptors = async <T>(
        input: string,
        res: Response,
        init?: RequestInit,
    ): Promise<T | undefined> => {
        const json: YukuResponse<T> = await res.json();

        if (json.code === 6) {
            message.error(
                'Can not connect to yuku, please contact the yuku. Error: ' + json.message,
            );
            return;
        }

        // if (json.code === 2006) {
        //     message.error(
        //         'Can not connect to yuku, please contact the yuku. Error: ' + json.message,
        //     );
        //     return;
        // }

        if (json.code === 8 && reconnect_times > 0) {
            --reconnect_times;

            const token = await connect2YukuByPrincipal();
            init!.headers!['X-Token'] = token;
            const response = await fetch(input, init);
            const filteredResYuku = await yukuInterceptors<T>(input, response, init);
            reconnect_times = 2;
            return filteredResYuku;
        }

        if (json.code === 0) return json.data;

        console.error(`can not fetch ${input}`, json.message);
        throw new Error(`${JSON.stringify(json)}`);
    };

    (window as any).yukuFetch = async <T>(
        input: string,
        init?: RequestInit,
    ): Promise<T | undefined> => {
        const response = await fetch(input, init);
        const data = await yukuInterceptors<T>(input, response, init);
        return data;
    };
};
