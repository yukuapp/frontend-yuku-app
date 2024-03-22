import { isMobile } from 'react-device-detect';
import { cdn } from '@/common/cdn';
import { cn } from '@/common/cn';

export type ValidationResult = {
    minMaxLength: boolean;
    includesUpperLetter: boolean;
    includesNumber: boolean;
    includesSpecialChar: boolean;
    isValid: boolean;
};
export default function PasswordTips({
    validationResults,
}: {
    validationResults?: ValidationResult;
}) {
    return (
        <ul
            className={cn(
                'absolute -top-10 left-full z-[100px] flex w-[226px] translate-x-[10px] flex-col gap-y-[18px] rounded-[6px] border border-[#3C3C3C] bg-[#1F2432] px-[13px] py-[17px] text-sm  text-white',
                isMobile && '-left-2 top-full h-[160px]',
            )}
        >
            <li className="flex items-center gap-x-2" key={'minMaxLength'}>
                <img
                    src={`/img/login/${!validationResults?.minMaxLength ? 'in' : ''}valid.svg`}
                    alt=""
                />
                8-28 characters
            </li>
            <li className="flex items-center gap-x-2" key={'includesUpperLetter'}>
                <img
                    src={cdn(
                        `/img/login/${
                            !validationResults?.includesUpperLetter ? 'in' : ''
                        }valid.svg`,
                    )}
                    alt=""
                />
                At least 1 uppercase letter
            </li>
            <li className="flex items-center gap-x-2" key={'includesNumber'}>
                <img
                    src={cdn(
                        `/img/login/${!validationResults?.includesNumber ? 'in' : ''}valid.svg`,
                    )}
                    alt=""
                />
                At least 1 number
            </li>
            <li className="flex items-center gap-x-2" key={'includesSpecialChar'}>
                <img
                    src={cdn(
                        `/img/login/${
                            !validationResults?.includesSpecialChar ? 'in' : ''
                        }valid.svg`,
                    )}
                    alt=""
                />
                At least 1 symbol
            </li>
        </ul>
    );
}
