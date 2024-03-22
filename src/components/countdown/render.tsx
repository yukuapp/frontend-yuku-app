export default function CountdownRenderer({ days, hours, minutes, seconds, completed }) {
    const time = { days, hours, mins: minutes, secs: seconds };
    if (completed) {
        // Render a completed state
        return <div>success</div>;
    } else {
        // Render a countdown
        return (
            <div className="flex gap-x-[19px]">
                {Object.keys(time).map((key) => (
                    <div key={key} className="flex flex-col">
                        <div
                            className={`flex h-11 w-11 flex-col items-center justify-center rounded-lg bg-[#283047]/70 text-sm font-semibold text-white`}
                        >
                            <div className="flex">
                                <div className="w-[9px] text-center">
                                    {time[key].toString().padStart(2, '0')[0]}
                                </div>
                                <div className="w-[9px] text-center">
                                    {time[key].toString().padStart(2, '0')[1]}
                                </div>
                            </div>
                        </div>
                        <div className={`mt-[8px] text-center text-[12px] text-white`}>
                            {key.replace(/^\w/, (c) => c.toUpperCase())}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}
