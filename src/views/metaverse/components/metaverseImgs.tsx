import { motion } from 'framer-motion';

export default function MetaverseImgs() {
    return (
        <div className="mx-auto mt-[140px] max-w-[1920px] px-[20px] lg:px-[40px]">
            <div className="mt-[20px] flex w-full items-center justify-between md:mt-[80px]">
                <span
                    className={`relative mr-[50px] flex cursor-pointer items-center justify-center font-[Inter-Bold] text-[20px] text-white duration-300 md:text-[28px]`}
                >
                    Avatars & Virtual Environment Design
                </span>
            </div>

            <div className="mt-[30px] columns-2 gap-3 md:columns-3">
                {new Array(10).fill('').map((_, idx) => {
                    return (
                        <div
                            key={`${idx}_imgs_metaverse`}
                            className="mb-[20px]"
                            data-aos="fade-down"
                            // data-aos-duration="600"
                            data-aos-delay={100 * idx}
                        >
                            <div className="overflow-hidden rounded-[24px]">
                                <motion.img
                                    src={`/img/metaverse/${idx + 1}.png`}
                                    whileHover={{
                                        scale: 1.1,
                                        transition: { duration: 0.3 },
                                    }}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
