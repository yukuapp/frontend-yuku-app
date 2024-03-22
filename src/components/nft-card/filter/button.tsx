import { cn } from '@/common/cn';

const FilterButton = ({
    open,
    setOpen,
    className,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                'flex h-[46px] w-[115px] cursor-pointer items-center justify-center rounded-[8px] bg-[#191E2E] transition-all duration-300 hover:bg-[#191E2E]/60',
                open && 'bg-[#191E2E]/60',
                className,
            )}
            onClick={() => setOpen(!open)}
        >
            <img
                className="block h-[17px] w-[17px] flex-shrink-0"
                src={'/img/market/filter-link.svg'}
                alt=""
            />
            <div className="ml-[8px] font-inter text-[14px] font-bold text-[#f6f6f6]">Filters</div>
        </div>
    );
};
export default FilterButton;
