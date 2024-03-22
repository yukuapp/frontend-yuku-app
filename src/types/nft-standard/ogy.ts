export type NftTokenOwnerMetadataOgy = {
    token_id: string;
    account:
        | {
              account_id: string;
          }
        | { principal: string } // ? principal -> string
        | { extensible_json: string } // ? CandyShared -> json (bigint -> string)
        | {
              account: {
                  owner: string; // ? principal -> string
                  sub_account?: number[];
              };
          }; // bearer_batch_nft_origyn
};
