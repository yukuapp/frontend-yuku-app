export const canister_query = async <T>(url: string): Promise<T | undefined> =>
    new Promise((resolve) => {
        fetch(url)
            .then((r) => r.json())
            .then(
                (
                    json:
                        | {
                              spend: string[]; // Time spent in milliseconds
                              created: number; // Timestamp in milliseconds
                              code: 0; // Status code, 0 represents success
                              message: 'success'; // Additional information
                              data?: T; // Data
                          }
                        | {
                              spend?: undefined; // Time spent in milliseconds
                              created: number; // Timestamp in milliseconds
                              code: number; // Status code, 0 represents success
                              message: string; // Additional information
                              data?: undefined; // Data
                          },
                ) => {
                    // console.debug(`🚀 ~ file: query.ts:23 ~ canister_query ~ json:`, json);
                    resolve(json.data);
                },
            )
            .catch((e) => {
                console.error(`🚀 ~ file: query.ts:7 ~ canister_query ~ e:`, e);
                resolve(undefined);
            });
    });
