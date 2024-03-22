import { NftIdentifier } from '../nft';

export type NftTokenOwnerMetadataCcc = {
    owner: string; // principal
    proxy?: string;
    other:
        | {
              type: 'bjcsj-rqaaa-aaaah-qcxqq-cai'; // ! bjcsj-rqaaa-aaaah-qcxqq-cai
              bucketCanisterId: string; // ? principal -> string
              index: string; // ? bigint -> string
          }
        | {
              type: 'ml2cx-yqaaa-aaaah-qc2xq-cai'; // ! ml2cx-yqaaa-aaaah-qc2xq-cai
              photoLink?: string;
              videoLink?: string;
              index: string; // ? bigint -> string
          }
        | {
              type: 'o7ehd-5qaaa-aaaah-qc2zq-cai'; // ! o7ehd-5qaaa-aaaah-qc2zq-cai
              photoLink?: string;
              videoLink?: string;
              index: string; // ? bigint -> string
          }
        | {
              type: 'nusra-3iaaa-aaaah-qc2ta-cai'; // ! nusra-3iaaa-aaaah-qc2ta-cai
              photoLink?: string;
              videoLink?: string;
              index: string; // ? bigint -> string
          };
};

export type CccProxyNft = {
    token_id: NftIdentifier; // ? principal -> string
    owner: string; // ? principal -> string
};
