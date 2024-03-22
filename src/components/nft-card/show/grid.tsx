import YukuIcon from '@/components/ui/yuku-icon';
import { cn } from '@/common/cn';

export type NftGridType = 'middle' | 'small';

function NftCardGrid({
    grid,
    setGrid,
}: {
    grid: NftGridType;
    setGrid: (grid: NftGridType) => void;
}) {
    const onGrid = (type: NftGridType) => {
        if (grid === type) return;
        setGrid(type);
    };

    return (
        <div className="ml-[27px] hidden items-center rounded-[8px] bg-[#191E2E] md:flex">
            <div
                className={cn(
                    'flex h-full w-12 cursor-pointer rounded-[8px] px-[6px] py-[4px] opacity-50',
                    grid === 'middle' && 'bg-[#22283E] opacity-100',
                )}
                onClick={() => onGrid('middle')}
            >
                <YukuIcon
                    name="grid-middle"
                    className="m-auto"
                    color={grid === 'middle' ? 'white' : 'gray'}
                />
            </div>

            <div
                className={cn(
                    'flex h-full w-12 cursor-pointer rounded-[8px] px-[6px] py-[4px] opacity-50',
                    grid === 'small' && 'bg-[#22283E] opacity-100',
                )}
                onClick={() => onGrid('small')}
            >
                <YukuIcon
                    name="grid-small"
                    className="m-auto scale-[1.2]"
                    color={grid === 'small' ? 'white' : 'gray'}
                />
            </div>
        </div>
    );
}

export default NftCardGrid;
