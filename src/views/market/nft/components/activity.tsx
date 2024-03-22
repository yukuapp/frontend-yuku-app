import dayjs from 'dayjs';
import ShowNumber from '@/components/data/number';
import TokenPrice from '@/components/data/price';
import Username from '@/components/user/username';
import { usePersistentQueryIcpPriceUsd } from '@/hooks/common/price';
import { getLedgerIcpDecimals } from '@/utils/canisters/ledgers/special';
import { NFTEvent } from '@/apis/yuku/api_data';
import { sinceNowByByNano } from '@/common/data/dates';
import { exponentNumber } from '@/common/data/numbers';
import { shrinkPrincipal } from '@/common/data/text';
import { isCanisterIdText } from '@/common/ic/principals';
import { bigint2string, string2bigint } from '@/common/types/bigint';

const Activity = ({ activity }: { activity: NFTEvent }) => {
    const icp_price_usd = usePersistentQueryIcpPriceUsd(
        dayjs(Number(bigint2string(string2bigint(activity.created_at) / string2bigint('1000000'))))
            .utc()
            .format('DD-MM-YYYY'),
    );
    const price_usd =
        Number(exponentNumber(activity.token_amount, -getLedgerIcpDecimals())) *
        (icp_price_usd || 0);
    return (
        <div
            key={activity.created_at + activity.canister}
            className="list-0 flex cursor-pointer items-center border-b border-[#262E47] py-[12px] text-left hover:bg-[#283047] lg:py-[17px]"
        >
            <div className="mr-[10px] min-w-[100px] font-inter-semibold text-[14px]  lg:w-[20%]">
                {showEventType(activity.eventType)}
            </div>
            <div className="mr-[10px] flex min-w-[100px] items-end lg:w-[20%]">
                <span className="font-inter-semibold text-[14px]">
                    <TokenPrice
                        value={{
                            value: activity.token_amount,
                            decimals: { type: 'exponent', value: 8 },
                            paddingEnd: 2,
                        }}
                    />
                </span>
                <span className="ml-[3px] font-inter-bold text-[12px] text-white/60">ICP</span>
                <span className="hidden font-inter-medium text-[14px] text-white/60 lg:block">
                    ($
                    <ShowNumber
                        className="text-[14px]"
                        value={{
                            value: `${price_usd}` ?? '0',
                            scale: 2,
                        }}
                    />
                    )
                </span>
            </div>
            <div className="mr-[10px] min-w-[100px] font-inter-medium text-[14px] lg:w-[20%]">
                {isCanisterIdText(activity.from) ? (
                    <span>@{shrinkPrincipal(activity.from)}</span>
                ) : (
                    <span>
                        @<Username principal_or_account={activity.from} />
                    </span>
                )}
            </div>
            <div className="mr-[10px] min-w-[100px]  font-inter-medium text-[14px] lg:w-[20%]">
                {isCanisterIdText(activity.to) ? (
                    <span>@{activity.to}</span>
                ) : (
                    <span>
                        @<Username principal_or_account={activity.to} />
                    </span>
                )}
            </div>
            <div className="mr-[10px] min-w-[100px] font-inter-medium text-[14px] text-white lg:w-[20%]">
                {sinceNowByByNano(activity.created_at)}
            </div>
        </div>
    );
};
function NftActivities({ current }: { current: NFTEvent[] }) {
    return (
        <div className="w-full  flex-shrink-0 text-white  lg:px-[48px] lg:pb-[25px] lg:pt-[34px]">
            {current && current.map((activity) => <Activity activity={activity}></Activity>)}
        </div>
    );
}

export default NftActivities;

const showEventType = (type: string) => {
    switch (type) {
        case 'sale':
            return 'Sale';
        case 'sold':
            return 'Sale';
        case 'claim':
            return 'Claim';
    }
    return type;
};
