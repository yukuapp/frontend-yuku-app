import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import Price from '@/components/data/price';
import Usd from '@/components/data/usd';
import Username from '@/components/user/username';
import { getTokenDecimals } from '@/utils/canisters/ledgers/special';
import { NFTEvent } from '@/apis/yuku/api_data';
import { sinceNowByMillsAbbreviations } from '@/common/data/dates';
import { shrinkPrincipal } from '@/common/data/text';
import { isCanisterIdText } from '@/common/ic/principals';
import { parse_token_identifier } from '@/common/nft/ext';
import { string2bigint } from '@/common/types/bigint';
import { SupportedLedgerTokenSymbol } from '@/types/canisters/ledgers';

export const List = ({ itemData }: { itemData: NFTEvent }) => {
    return (
        <div className="mr-[15px] mt-[20px] flex h-10 w-full items-center md:mt-[24px] md:h-[64px]">
            <div className="hidden w-[90px] flex-shrink-0 font-['Inter'] text-sm font-semibold capitalize text-white lg:flex">
                {itemData.eventType === 'sold' ? 'Sales' : itemData.eventType}
            </div>

            <Link
                to={`/market/${itemData.canister}/${parse_token_identifier(
                    itemData.canister,
                    Number(itemData.token_id),
                )}`}
                className="mr-[15px] flex flex-[1] flex-shrink-0 items-center font-['Inter'] text-sm font-semibold text-white "
            >
                <img
                    className="mr-[10px] h-10 w-10 rounded-lg md:h-16 md:w-16"
                    src={itemData.nft_info.thumbnail_url}
                    alt=""
                />
                <p className="line-clamp-2 break-words">{itemData.nft_info.token_name}</p>
            </Link>
            <div className="flex flex-shrink-0 flex-col items-end md:flex-row md:items-start">
                <div className="flex w-[150px] flex-shrink-0 justify-end font-['Inter'] text-sm font-semibold text-white md:mr-[15px] md:justify-start md:text-left 2xl:w-[230px] 3xl:w-[350px]">
                    {itemData.token_amount ? (
                        <div className="flex flex-row md:flex-col">
                            <span>
                                <Price
                                    value={{
                                        value: itemData.token_amount.toString(),
                                        decimals: {
                                            type: 'exponent',
                                            value: getTokenDecimals(
                                                itemData.token_symbol.toLocaleUpperCase() as SupportedLedgerTokenSymbol,
                                            ),
                                        },
                                        symbol: '',
                                        scale: 2,
                                        paddingEnd: undefined,
                                    }}
                                    className="text-sm lg:text-sm"
                                ></Price>
                                &nbsp;{itemData.token_symbol}
                            </span>
                            <span className="ml-[5px] md:ml-0 md:mt-[2px]">
                                <Usd
                                    value={{
                                        value: itemData.token_amount.toString(),
                                        decimals: {
                                            type: 'exponent',
                                            value: getTokenDecimals(
                                                itemData.token_symbol.toLocaleUpperCase() as SupportedLedgerTokenSymbol,
                                            ),
                                        },
                                        symbol: itemData.token_symbol,
                                        scale: 2,
                                    }}
                                />
                            </span>
                        </div>
                    ) : (
                        '--'
                    )}
                </div>
                <div className="mr-[15px] hidden w-[150px] flex-shrink-0 cursor-pointer font-['Inter'] text-sm font-semibold text-white xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                    {isCanisterIdText(itemData.from) ? (
                        <span>@{shrinkPrincipal(itemData.from)}</span>
                    ) : (
                        <span className="flex">
                            {itemData.from ? '@' : ''}
                            <Username principal_or_account={itemData.from} />
                        </span>
                    )}
                </div>
                <div className="mr-[15px] hidden w-[150px] flex-shrink-0 cursor-pointer font-['Inter'] text-sm font-semibold text-white xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                    {isCanisterIdText(itemData.to) ? (
                        <span>@{itemData.to}</span>
                    ) : (
                        <span className="flex">
                            {itemData.to ? '@' : ''}
                            <Username principal_or_account={itemData.to} />
                        </span>
                    )}
                </div>
                <div className="flex w-[90px] flex-shrink-0 justify-end font-['Inter'] text-sm font-semibold text-[#999] md:mr-[15px] md:text-white xl:w-[100px]">
                    {sinceNowByMillsAbbreviations(
                        Number(string2bigint(itemData.created_at) / BigInt(1000000)),
                    )}
                </div>
            </div>
        </div>
    );
};

export const ListSkeleton = () => {
    return (
        <div className="mt-[24px] flex h-10 w-full items-center md:h-[64px]">
            <div className="mr-[15px] hidden w-[90px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:w-[100px] lg:flex">
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0" />
            </div>
            <div className="mr-[15px] flex flex-[1] flex-shrink-0 items-center font-['Inter'] text-sm font-semibold text-white text-opacity-70 ">
                <div className="flex h-10 w-10 rounded-[8px] md:h-[64px] md:w-[64px]">
                    <Skeleton.Image active className="mr-[10px] !h-full !w-full !min-w-0" />
                </div>
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0 flex-1" />
            </div>
            <div className="mr-[15px] hidden w-[90px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:flex md:w-[150px] 2xl:w-[230px] 3xl:w-[350px]">
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0" />
            </div>
            <div className="mr-[15px] hidden w-[150px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0" />
            </div>
            <div className="mr-[15px] hidden w-[150px] flex-shrink-0 font-['Inter'] text-sm font-semibold text-white text-opacity-70 xl:flex 2xl:w-[230px] 3xl:w-[350px]">
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0" />
            </div>
            <div className="flex w-[90px] flex-shrink-0 justify-end font-['Inter'] text-sm font-semibold text-white text-opacity-70 md:mr-[15px] xl:w-[100px]">
                <Skeleton.Input active className="flex !h-[20px] !w-full !min-w-0" />
            </div>
        </div>
    );
};
