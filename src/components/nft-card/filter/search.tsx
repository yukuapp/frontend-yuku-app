import { cn } from '@/common/cn';

const FilterSearch = ({
    className,
    search,
    setSearch,
    placeholder = 'Search by name',
}: {
    className?: string;
    search: string;
    setSearch: (value: string) => void;
    placeholder?: string;
}) => {
    const onChange = ({ target: { value } }) => {
        if (value !== search) setSearch(value);
    };

    return (
        <div
            className={cn(
                [
                    'mr-[15px] flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[8px] bg-[#191e2e] md:mr-[27px]',
                ],
                className,
            )}
        >
            <div className="mx-[9px] my-[15px] block h-[14px] w-[14px] flex-shrink-0 cursor-pointer md:h-[16px] md:w-[16px]">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                >
                    <path
                        d="M8.34001 15.5399C4.38001 15.5399 1.14001 12.2999 1.14001 8.33989C1.14001 4.37989 4.38001 1.13989 8.34001 1.13989C12.3 1.13989 15.54 4.37989 15.54 8.33989C15.54 12.2999 12.3 15.5399 8.34001 15.5399ZM8.34001 14.3399C11.64 14.3399 14.34 11.6399 14.34 8.33989C14.34 5.03989 11.64 2.33989 8.34001 2.33989C5.04001 2.33989 2.34001 5.03989 2.34001 8.33989C2.34001 11.6399 5.04001 14.3399 8.34001 14.3399ZM12.78 15.2999C12.54 15.0599 12.6 14.6399 12.84 14.4599C13.08 14.2799 13.5 14.2799 13.68 14.5199L14.82 15.8999C15.06 16.1399 15 16.5599 14.76 16.7399C14.52 16.9199 14.1 16.9199 13.92 16.6799L12.78 15.2999Z"
                        fill="white"
                    />
                </svg>
            </div>
            {/* <img
                className="mx-[9px] my-[15px] block h-[14px] w-[14px] flex-shrink-0 cursor-pointer md:h-[16px] md:w-[16px]"
                src={'/img/market/search-icon.svg'}
                alt=""
            /> */}
            <input
                className="h-full w-full border-none bg-[#191e2e] font-inter text-[14px] font-medium text-[#B6B6B6] placeholder:text-white/60 focus:outline-none lg:text-[16px]"
                placeholder={placeholder}
                onChange={onChange}
                value={search}
                type="text"
            />
        </div>
    );
};

export default FilterSearch;
