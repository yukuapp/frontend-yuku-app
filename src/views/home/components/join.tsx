export default function HomeJoin() {
    return (
        <div className="mx-auto w-full max-w-[1920px] px-[20px] lg:px-[40px]">
            <div className="mt-[90px] flex w-full text-[28px] font-semibold text-white">
                Join Us
            </div>
            <div className="flex flex-col">
                <div className="flex">
                    <p className="font-['Inter'] text-[64px] font-semibold leading-tight text-white">
                        CREATE (Creator UGC)
                    </p>
                </div>
                <div className="flex w-full flex-col md:flex-row">
                    <div className="mt-[30px] flex h-[627px] flex-1 items-end rounded-2xl bg-gradient-to-r from-teal-400 via-blue-600 to-sky-500 md:mr-[45px] md:mt-0">
                        <p className="my-[50px] ml-[40px] font-['Inter'] text-3xl font-semibold leading-[100%] text-white md:mb-[120px] md:text-4xl xl:text-5xl">
                            Decentralized & Tokenomics
                        </p>
                    </div>

                    <div className="mt-[30px] flex h-[627px] flex-1 items-end rounded-2xl bg-gradient-to-r from-amber-400 via-orange-600 to-orange-500 md:mt-0">
                        <p className="my-[50px] ml-[40px] font-['Inter'] text-3xl font-semibold leading-[100%] text-white md:mb-[120px] md:text-4xl xl:text-5xl">
                            Marketing & Monetization
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
