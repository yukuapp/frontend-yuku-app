import { useEffect, useState } from 'react';
import { cdn } from '@/common/cdn';
import { parseLowerCaseSearch } from '@/common/data/search';
import { FirstRenderByData } from '@/common/react/render';
import { useDeviceStore } from '@/stores/device';
import FilterSearch from './search';

export type FilterCollection = 'gold' | string | 'others';
export type FilterCollectionOption = {
    collection: FilterCollection;
    name: 'Gold' | string | 'Others';
    collections: string[];
    logo: string;
    count: number;
};
const INITIAL_LENGTH = 10;
const FilterCollections = ({
    value,
    options,
    setOptions,
    setOpen,
    loaded,
}: {
    value: FilterCollection[];
    options: FilterCollectionOption[];
    setOptions: (value: FilterCollection[]) => void;
    setOpen?: (open: boolean) => void;
    loaded: boolean;
}) => {
    const { isMobile } = useDeviceStore((s) => s.deviceInfo);

    const showFoldButton = (value: FilterCollection[], options: FilterCollectionOption[]) => {
        if (options.length <= INITIAL_LENGTH) return false;
        for (const v of value) {
            const index = options.findIndex((option) => option.collection === v);
            if (index >= INITIAL_LENGTH) return false;
        }
        return true;
    };

    const [fold, setFold] = useState(showFoldButton(value, options));
    const [once_checking_fold] = useState(new FirstRenderByData());
    useEffect(
        () =>
            once_checking_fold.once([options.map((o) => o.collection).join('|')], () =>
                setFold(showFoldButton(value, options)),
            ),
        [options],
    );

    const [collectionSearch, setCollectionSearch] = useState('');
    const search = parseLowerCaseSearch(collectionSearch);
    const filteredOption = search
        ? options.filter((o) => o.name.toLowerCase().indexOf(search) > -1)
        : options;

    const wrappedOptions =
        fold && !search ? [...filteredOption].splice(0, INITIAL_LENGTH) : filteredOption;

    const onFold = () => setFold(!fold);

    const onChoose = (collection: FilterCollection) => {
        if (value.includes(collection)) {
            const newOptions = value.filter((v) => v !== collection);
            setOptions(newOptions);
        } else {
            const newOptions = [...value, collection];
            setOptions(newOptions);
        }
        if (isMobile) {
            setOpen && setOpen(false);
        }
    };

    return (
        <div className=" flex flex-col items-center rounded-[16px] border-[2px] border-[#283047] bg-[#101522] px-[20px]  pt-[20px]">
            <FilterSearch
                search={collectionSearch}
                setSearch={setCollectionSearch}
                className="mr-0! mb-[15px] w-full rounded-[8px] md:mr-0"
            />
            <div className="mb-2 font-inter-medium text-[14px] text-white">
                Total {wrappedOptions.length} collections{' '}
            </div>
            <div style={{ minHeight: 'calc(100vh - 145px)' }} className="flex w-full flex-col">
                {wrappedOptions.map((option) => {
                    return (
                        <div
                            key={option.collection}
                            className={
                                value.includes(option.collection)
                                    ? 'chosen mb-[1px] flex cursor-pointer items-center rounded-[8px] !bg-[#242C43] py-[11px]'
                                    : 'mb-[1px] flex cursor-pointer items-center py-[11px] hover:rounded-[8px]'
                            }
                            style={{
                                background: value.includes(option.collection) ? '#F6F6F6' : '',
                            }}
                            onClick={() => {
                                onChoose(option.collection);
                            }}
                        >
                            <div
                                className="flex h-[41px] w-[41px] cursor-pointer items-center justify-center rounded-[4px]"
                                style={{
                                    background:
                                        option.logo.indexOf('/svgs/logo/collection-') > -1
                                            ? '#F0F0F0'
                                            : '',
                                }}
                            >
                                <img
                                    className="h-full w-full"
                                    src={cdn(option.logo)}
                                    style={{
                                        transform:
                                            option.logo.indexOf('/svgs/logo/collection-') > -1
                                                ? 'scale(0.8)'
                                                : '',
                                    }}
                                    alt=""
                                />
                            </div>
                            <div className="ml-[10px] flex-1 truncate font-inter-medium text-[14px] text-white/70">
                                {option.name}
                            </div>
                            <div className="ml-[10px] h-[24px] w-[24px] flex-shrink-0 rounded-[50%]  text-center leading-6 text-white md:mr-[5px]">
                                {option.count}
                            </div>
                        </div>
                    );
                })}
            </div>
            {showFoldButton(value, options) && loaded && !search && (
                <>
                    {fold ? (
                        <div
                            className="m-auto mb-5 mt-[19px] h-[35px] w-[169px] flex-shrink-0 cursor-pointer rounded-[8px] bg-shiku text-center font-inter-medium
          text-[14px] font-semibold leading-[35px] text-white transition-all duration-300 hover:bg-shiku/70"
                            onClick={onFold}
                        >
                            unfold
                        </div>
                    ) : (
                        <div
                            className="m-auto mb-5 mt-[19px] h-[35px] w-[169px] flex-shrink-0 cursor-pointer rounded-[8px] bg-shiku text-center font-inter-medium
          text-[14px] font-semibold leading-[35px] text-white transition-all duration-300 hover:bg-shiku/70"
                            onClick={onFold}
                        >
                            fold
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default FilterCollections;
