import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BarCustomLayerProps, ResponsiveBar } from '@nivo/bar';
import { useTooltip } from '@nivo/tooltip';
import { line } from 'd3-shape';
import { useInterval } from 'usehooks-ts';
import { SHOW_DAYS, Volume } from '@/views/market/collection/components/dash-board';
import { cn } from '@/common/cn';

const CustomBarLayer = ({
    bars,
    innerHeight,
}: BarCustomLayerProps<{ time: string; volume: number; sales: number }>) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | undefined>(undefined);

    const { showTooltipFromEvent, hideTooltip } = useTooltip();
    useInterval(() => {
        !hoveredIndex && hideTooltip();
    }, 1200);

    return (
        <>
            {bars.map((bar, index) => {
                const isHovered = index === hoveredIndex;

                const { sales, volume } = bar.data.data;
                const avgPrice = sales ? (volume / sales).toFixed(volume / sales < 1 ? 3 : 2) : 0;

                const tooltipContent = (
                    <div
                        style={{
                            color: 'white',
                            background: 'linear-gradient(180deg, #1c253b 0%, #131827 100%)',
                            borderRadius: '4px',
                        }}
                        className="flex flex-col gap-y-2 p-4 text-sm"
                    >
                        <div>
                            <strong>Volume:</strong> {volume ?? 0} ICP
                        </div>{' '}
                        <div>
                            <strong>Count:</strong> {sales ?? 0}
                        </div>
                        <div>
                            <strong>Average Price:</strong> {avgPrice} ICP
                        </div>
                    </div>
                );

                return (
                    <rect
                        key={bar.key}
                        x={bar.x - 10}
                        y={-1}
                        width={bar.width + 20}
                        height={innerHeight + 2}
                        fill="rgb(243,255,255)"
                        onMouseMove={(event) => {
                            if (bar.data.data.volume) {
                                setHoveredIndex(index);
                                showTooltipFromEvent(tooltipContent, event);
                            } else {
                                setHoveredIndex(undefined);
                            }
                        }}
                        onMouseLeave={() => {
                            setHoveredIndex(undefined);
                        }}
                        style={{
                            transition: 'all 250ms ease-in-out',
                            opacity: isHovered && bar.data.data.volume ? 0.1 : 0,
                            cursor: bar.data.data.volume ? 'pointer' : 'auto',
                        }}
                    />
                );
            })}
        </>
    );
};

const Chart = ({ volumeData }: { volumeData: Volume[] }) => {
    const showDefault = volumeData.length === 0 || volumeData.every((v) => v.volume === 0);

    const MAX_PRICE = 10;
    const MAX_VOLUME = 100;

    const currentDate = new Date();

    const recentDates: string[] = [];

    for (let i = 0; i < SHOW_DAYS; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - SHOW_DAYS - 1 + i);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        recentDates.push(month + '/' + day);
    }

    const showedVolumeData: Volume[] = showDefault
        ? recentDates.map((d) => ({ time: d, volume: 0, sales: 0 }))
        : volumeData;

    const lineData = [
        {
            id: 'price',
            data: volumeData.map((v) => ({ x: v.time, y: v.sales ? v.volume / v.sales : 0 })),
        },
    ];
    const maxPrice = showDefault
        ? MAX_PRICE
        : lineData[0].data.reduce(
              (max, item) => (item.y > max ? item.y : max),
              lineData[0].data[0].y,
          );
    const maxVolume = showDefault
        ? MAX_VOLUME
        : volumeData.reduce(
              (max, item) => (item.volume > max ? item.volume : max),
              volumeData[0].volume,
          );

    const formattedLineData = [
        {
            id: 'price',
            data: volumeData.map((v) => ({
                x: v.time,
                y: v.sales ? (v.volume * maxVolume) / v.sales / maxPrice : 0,
            })),
        },
    ];

    const CustomLineLayer = ({ xScale, yScale }) => {
        if (showDefault) {
            return <></>;
        }

        const points = formattedLineData[0].data.map((point) => ({
            x: xScale(point.x) + xScale.bandwidth() / 2,
            y: yScale(point.y),
        }));

        const lineGenerator = line()
            .x((point) => point.x)
            .y((point) => point.y);

        const pathData = lineGenerator(points);
        return <path d={pathData} fill="none" stroke="#2195FF" strokeWidth={2} />;
    };
    const { showTooltipAt, hideTooltip } = useTooltip();
    return (
        <div
            className="relative mt-10 h-[404px] w-full"
            onMouseLeave={() => {
                showTooltipAt(<></>, [0, 0]);
                hideTooltip();
            }}
        >
            <div
                className={cn(
                    'absolute left-[60px] right-[60px] flex items-center justify-between font-inter-semibold text-base',
                    isMobile && 'left-[10px] right-[10px] text-sm',
                )}
            >
                <div>Daily Volume</div>
                <div>Price</div>
            </div>
            <ResponsiveBar
                data={showedVolumeData}
                keys={['volume']}
                enableLabel={false}
                indexBy="time"
                margin={{
                    top: 40,
                    right: isMobile ? 50 : 100,
                    bottom: 50,
                    left: isMobile ? 50 : 100,
                }}
                padding={isMobile ? 0.7 : 0.8}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['white']}
                borderColor={'white'}
                borderRadius={5}
                borderWidth={2}
                axisTop={null}
                axisRight={{
                    tickSize: 5,
                    tickValues: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    format: (value) => ((value * maxPrice) / maxVolume).toFixed(2),
                }}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legendPosition: 'middle',
                }}
                axisLeft={{
                    tickSize: 5,
                    tickValues: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    format: (value) => value.toFixed(value > 1 ? 1 : 2),
                }}
                gridYValues={5}
                theme={{
                    grid: {
                        line: {
                            stroke: '#283047',
                            strokeWidth: 1,
                        },
                    },
                    axis: {
                        ticks: {
                            line: {
                                stroke: '#283047',
                                strokeWidth: 1,
                            },
                            text: {
                                fill: '#999999',
                                fontSize: 12,
                            },
                        },

                        legend: {
                            text: {
                                fill: 'white',
                                fontFamily: 'Inter-Semibold',
                                transform: 'rotate(0deg) translateX(60px)',
                                fontSize: 16,
                            },
                        },
                    },
                }}
                layers={[
                    'grid',
                    'axes',
                    'bars',
                    'markers',
                    'legends',
                    CustomBarLayer,
                    CustomLineLayer,
                ]}
            />
        </div>
    );
};

export default Chart;
