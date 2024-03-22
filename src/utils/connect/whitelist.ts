const initial: string[] = [];

let whitelist: string[] = [];

export const initWhitelist = (list: string[]) => {
    initial.splice(0, 0, ...list);
    whitelist = [...initial];
};

export const resetWhitelist = () => (whitelist = [...initial]);

export const updateWhitelist = (list: string[]) => whitelist.splice(0, 0, ...list);

export const diffWhitelist = (needs: string[]): string[] =>
    needs.filter((canister_id) => !whitelist.includes(canister_id));
