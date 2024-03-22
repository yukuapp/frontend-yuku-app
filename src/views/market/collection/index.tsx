import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollectionData, useCollectionTokenOwners } from '@/hooks/views/market';
import { cn } from '@/common/cn';
import { isCanisterIdText } from '@/common/ic/principals';
import { FirstRenderByData } from '@/common/react/render';
import { Spend } from '@/common/react/spend';
import MarketCollectionActivity from './components/activity';
import MarketCollectionHeader from './components/header';
import MarketCollectionItems from './components/items';

function MarketCollectionPage() {
    const navigate = useNavigate();

    const param = useParams();
    const collection = param.collection;

    const [once_check_collection] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_check_collection.once([collection], () => {
                if (!isCanisterIdText(collection)) return navigate('/', { replace: true });
            }),
        [collection],
    );

    const data = useCollectionData(collection);
    const [once_check_data_spend] = useState(new FirstRenderByData());
    const [spend_data] = useState(Spend.start(`market collection index !!!!!!!!!!!!!!!`));
    useEffect(() => {
        once_check_data_spend.once([!!data], () => {
            spend_data.mark(`data is ${data ? 'exist' : 'not exist'}`);
        });
    }, [data]);

    const owners = useCollectionTokenOwners(collection, data);
    const [once_check_owners] = useState(new FirstRenderByData());
    const [spend_owners] = useState(Spend.start(`market collection index @@@@@@@@@@@@@@@`));
    useEffect(() => {
        once_check_owners.once(data && [(owners ?? []).length], () => {
            spend_owners.mark(`owners is ${owners?.length} data ${data ? 'exist' : 'not exist'}`);
        });
    }, [data, owners]);

    const [tab, setTab] = useState<'items' | 'activity'>('items');

    if (!isCanisterIdText(collection)) return <></>;
    return (
        <>
            <div className="market-collection">
                <MarketCollectionHeader data={data} owners={owners} />
                <div className="mx-[15px] flex items-center border-b border-solid border-[#262E47] pb-[30px] md:mx-[40px]">
                    <div
                        className={cn([
                            'mr-[37px] flex h-[46px] cursor-pointer rounded-lg px-4 font-inter-bold text-[18px] text-white/60',
                            tab === 'items' && ' bg-[#1c2234] text-white',
                        ])}
                        onClick={() => setTab('items')}
                    >
                        <div className="m-auto leading-none">Items</div>
                    </div>
                    <div
                        className={cn([
                            'flex h-[46px] cursor-pointer rounded-lg px-4 font-inter-bold  text-[18px] text-white/60',
                            tab === 'activity' && 'bg-[#1c2234] text-white',
                        ])}
                        onClick={() => setTab('activity')}
                    >
                        <div className="m-auto leading-none">Activity</div>
                    </div>
                </div>
                {tab === 'items' &&
                    (collection === undefined || data === undefined || owners === undefined) && (
                        <div></div>
                    )}
                {tab === 'items' && (
                    <MarketCollectionItems
                        collection={collection!}
                        data={data!}
                        owners={owners!}
                        loading={
                            !(
                                collection !== undefined &&
                                data !== undefined &&
                                owners !== undefined
                            )
                        }
                    />
                )}
                {tab === 'activity' && collection === undefined && <div></div>}
                {tab === 'activity' && collection !== undefined && (
                    <MarketCollectionActivity collection={collection} />
                )}
            </div>
        </>
    );
}

export default MarketCollectionPage;
