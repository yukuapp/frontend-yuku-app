import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TextShowMore } from '@/components/data/text';
import { cn } from '@/common/cn';
import { NftMetadata, NftTokenMetadata } from '@/types/nft';

type NftTab = 'Description' | 'Details' | 'Properties';
type NftTrait = {
    name: string;
    value: string;
    count: number;
    all: number;
};

function NftTabs({
    collection,
    card,
    metadata,
}: {
    collection?: string;
    card?: NftMetadata;
    metadata?: NftTokenMetadata[];
}) {
    // NFT tab
    const [current, setCurrent] = useState<NftTab>('Description');
    const [tabs, setTabs] = useState<NftTab[]>(['Description', 'Details']);

    const [traits, setTraits] = useState<NftTrait[] | undefined>(undefined);

    useEffect(() => {
        if (traits) setTabs(['Description', 'Details', 'Properties']);
    }, [traits]);

    useEffect(() => {
        if (card?.metadata.metadata.traits.length && metadata) {
            const traits: NftTrait[] = [];
            for (const trait of card.metadata.metadata.traits) {
                const { name, value } = trait;
                let count = 0;
                for (const m of metadata) {
                    for (const t of m.metadata.traits) {
                        if (t.name === name && t.value === value) {
                            count++;
                            break;
                        }
                    }
                }
                traits.push({ name, value, count, all: metadata.length });
            }
            if (traits.length) setTraits(traits);
        }
    }, [card, metadata]);

    return (
        <>
            <ul className="m-auto my-[20px] flex w-full list-none items-center justify-between rounded-[8px] bg-[#283047] px-[16px] py-[4px] lg:mt-[23px] lg:w-[370px] lg:px-[13px]">
                {tabs.map((tab) => {
                    return (
                        <li
                            key={tab}
                            className={cn([
                                'cursor-pointer rounded-[8px] px-[14px] py-[10px] font-inter-bold  text-[12px] text-white/70 lg:px-[20px] lg:py-[11px] lg:text-[14px]',
                                current === tab && 'bg-shiku',
                            ])}
                            onClick={() => setCurrent(tab)}
                        >
                            {tab}
                        </li>
                    );
                })}
            </ul>
            {/* Description */}
            {current === 'Description' && (
                <div className="font-inter-normal mb-[26px] w-full text-[#737375] lg:mb-[98px] lg:mt-[42px] lg:w-[555px]">
                    <TextShowMore
                        text={
                            card?.metadata.metadata.description ||
                            card?.data?.info.description ||
                            ''
                        }
                        limit={210}
                    />
                </div>
            )}
            {/* Details */}
            {current === 'Details' && (
                <ul className="mb-[26px] mt-[23px] w-full list-none rounded-[16px] bg-[#283047] px-[24px] py-[13px] text-white shadow-[0_4px_10px_0_rgba(72,72,72,0.25)] lg:mb-[98px] lg:mt-[42px] lg:w-[524px] lg:px-[36px] lg:py-[28px]">
                    <li className="font-inter-normal mb-[9px] text-[14px]   lg:mb-[20px] lg:text-[16px]">
                        Chain: Internet Computer
                    </li>
                    <li className="font-inter-normal mb-[9px] text-[14px]   lg:mb-[20px] lg:text-[16px]">
                        Contract Address: {card?.metadata.token_id.collection}
                    </li>
                    <li className="font-inter-normal text-[14px]   lg:mb-[20px] lg:text-[16px]">
                        Creator Royalty: {card?.data?.info.royalties ?? '--'}%
                    </li>
                </ul>
            )}
            {current === 'Properties' && (
                <div className="mb-[26px] mt-[43px] flex w-full flex-wrap justify-between text-white lg:w-[530px] last:lg:mb-[63px]">
                    {(traits ?? []).map((trait) => (
                        <Link
                            key={`${trait.name}:${trait.value}`}
                            to={`/market/${collection}`}
                            state={{ trait: trait.name, value: trait.value }}
                            className="mb-[11px] w-[108px] flex-shrink-0 cursor-pointer rounded-[4px]  bg-[#283047] py-[13px] text-center drop-shadow-[0_5px_10px_rgba(36,19,115,0.20)] lg:mb-[15px] lg:w-[166px] lg:rounded-[8px] lg:py-[25px]"
                        >
                            <div className="font-inter-normal mb-[16px] text-[12px]">
                                {trait.name}
                            </div>
                            <div className="mb-[16px] font-inter-bold text-[14px] ">
                                {trait.value}
                            </div>
                            <div className="font-inter-normal text-[12px]">
                                {((100 * trait.count) / trait.all).toFixed(2)}% have this trait
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

export default NftTabs;
