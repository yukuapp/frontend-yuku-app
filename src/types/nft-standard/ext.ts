export type NftTokenOwnerMetadataExt = {
    index: number;
    owner: string;
    proxy?: string;
};

export type ExtUser =
    | { principal: string; address?: undefined } // ? principal -> string
    | { principal?: undefined; address: string };
