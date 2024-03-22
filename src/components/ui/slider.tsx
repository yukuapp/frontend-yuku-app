import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/common/cn';

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-[5px] w-full grow overflow-hidden rounded-full bg-[#2F3851]">
            <SliderPrimitive.Range className="absolute h-full bg-shiku" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-[12px] w-[12px] cursor-pointer rounded-full bg-[#2F3851]  ring-offset-background transition-colors focus-visible:outline-none  disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
