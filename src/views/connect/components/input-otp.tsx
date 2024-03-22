import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LoadingOutlined } from '@ant-design/icons';
import message from '@/components/message';
import { YukuButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerEmail } from '@/utils/apis/yuku/api';
import { cn } from '@/common/cn';

// eslint-disable-next-line no-unused-vars
enum KEYCODE {
    // eslint-disable-next-line no-unused-vars
    LEFT_ARROW = 37,
    // eslint-disable-next-line no-unused-vars
    RIGHT_ARROW = 39,
    // eslint-disable-next-line no-unused-vars
    HOME = 36,
    // eslint-disable-next-line no-unused-vars
    END = 35,
    // eslint-disable-next-line no-unused-vars
    SPACE = 32,
    // eslint-disable-next-line no-unused-vars
    BACK_SPACE = 8,
}

interface InputOTPProps {
    pinLength: number;
    sendingCode: boolean;
    resend: () => Promise<void>;
    registerForm: UseFormReturn<
        {
            email: string;
            password: string;
        },
        any,
        undefined
    >;
    prev: () => void;
    next: () => void;
}

const InputOTP = ({ pinLength, resend, prev, sendingCode, registerForm, next }: InputOTPProps) => {
    const [value, setValue] = useState<string>('');
    const inputsRef = useRef<HTMLInputElement[]>([]);
    const curFocusIndexRef = useRef<number>(0);

    const isInputValueValid = useCallback((value: string): boolean => {
        return /^\d+$/.test(value);
    }, []);

    const focusInput = useCallback((i: number): void => {
        const inputs = inputsRef.current;
        if (i >= inputs.length) return;
        const input = inputs[i];
        if (!input) return;
        input.focus();
        curFocusIndexRef.current = i;
    }, []);

    const focusNextInput = useCallback((): void => {
        const curFocusIndex = curFocusIndexRef.current;
        const nextIndex = curFocusIndex + 1 >= pinLength ? pinLength - 1 : curFocusIndex + 1;
        focusInput(nextIndex);
    }, [focusInput, pinLength]);

    const focusPrevInput = useCallback((): void => {
        const curFocusIndex = curFocusIndexRef.current;
        let prevIndex;
        if (curFocusIndex === pinLength - 1 && value.length === pinLength) {
            prevIndex = pinLength - 1;
        } else {
            prevIndex = curFocusIndex - 1 <= 0 ? 0 : curFocusIndex - 1;
        }
        focusInput(prevIndex);
    }, [focusInput, pinLength, value]);

    const handleOnDelete = React.useCallback(() => {
        const curIndex = curFocusIndexRef.current;
        if (curIndex === 0) {
            if (!value) return;
            setValue('');
        } else if (curIndex === pinLength - 1 && value.length === pinLength) {
            setValue(value.slice(0, curIndex));
        } else {
            setValue(value.slice(0, value.length - 1));
        }
        focusPrevInput();
    }, [focusPrevInput, value]);

    const handleOnKeyDown = React.useCallback(
        (e) => {
            switch (e.keyCode) {
                case KEYCODE.LEFT_ARROW:
                case KEYCODE.RIGHT_ARROW:
                case KEYCODE.HOME:
                case KEYCODE.END:
                case KEYCODE.SPACE:
                    e.preventDefault();
                    break;

                case KEYCODE.BACK_SPACE:
                    handleOnDelete();
                    break;
                default:
                    break;
            }
        },
        [handleOnDelete],
    );

    const handleClick = React.useCallback(() => {
        focusInput(curFocusIndexRef.current);
    }, [focusInput]);

    const handleChange = React.useCallback(
        (e) => {
            const val = e.target.value || '';
            if (!isInputValueValid(val)) return;
            if (val.length === 1) {
                focusNextInput();
                setValue(`${value}${val}`);
            }
        },
        [focusNextInput, isInputValueValid, value],
    );

    const handlePaste = React.useCallback(
        (e) => {
            e.preventDefault();
            const val = e.clipboardData.getData('text/plain').slice(0, pinLength);
            if (!isInputValueValid(val)) return;
            const len = val.length;
            const index = len === pinLength ? pinLength - 1 : len;

            setValue(val);
            focusInput(index);
        },
        [focusInput, isInputValueValid],
    );

    const [seconds, setSeconds] = useState(60);
    useEffect(() => {
        if (seconds === 0) return;

        const intervalId = setInterval(() => {
            setSeconds((seconds) => seconds - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [seconds]);

    const [registering, setRegistering] = useState<boolean>(false);
    const loading = sendingCode || registering;

    useEffect(() => {
        if (value.length === pinLength) {
            setRegistering(true);
            registerEmail({
                email: registerForm.watch('email'),
                password: registerForm.watch('password'),
                code: value,
            })
                .then(() => {
                    next();
                })
                .catch((e) => {
                    message.error(JSON.parse(e.message).message);
                })
                .finally(() => {
                    setRegistering(false);
                });
        }
    }, [value]);
    return (
        <div>
            <img
                src={'/img/login/code-prev.svg'}
                onClick={prev}
                className=" cursor-pointer "
                alt=""
            />
            <div className="mt-5 font-inter-semibold text-lg leading-none tracking-wide text-white">
                Email Verification Code
            </div>
            <div className="font-inter-normal w-70 mt-4 text-xs leading-tight text-white text-opacity-60">
                Please enter the 6-digit code we sent to your email{' '}
                <span className=" font-inter-semibold text-white">
                    {registerForm.getValues('email')}
                </span>
            </div>
            <div className="mt-6 flex items-center justify-between">
                {Array.from({ length: pinLength }).map((_, index) => {
                    const isFocused = index === curFocusIndexRef.current;
                    return (
                        <Input
                            key={index}
                            ref={(ref) => {
                                if (ref) {
                                    inputsRef.current[index] = ref;
                                }
                            }}
                            className={cn(
                                'h-12 w-12 rounded border border-[#3C3C3C] bg-[#1F2432] text-center font-inter-semibold text-base',
                                `pinInput ${isFocused ? 'focus' : ''}`,
                            )}
                            maxLength={1}
                            pattern="\d*"
                            autoComplete="off"
                            value={value[index] || ''}
                            onClick={handleClick}
                            onChange={handleChange}
                            onPaste={handlePaste}
                            onKeyDown={handleOnKeyDown}
                        />
                    );
                })}
            </div>
            <div className="mt-10 w-full">
                <YukuButton
                    type={'CONFIRM'}
                    onClick={() => {
                        if (loading) {
                            return;
                        }
                        if (seconds === 0) {
                            resend().then(() => {
                                setSeconds(60);
                            });
                        }
                    }}
                    className="w-full"
                >
                    {loading ? (
                        <LoadingOutlined></LoadingOutlined>
                    ) : seconds > 0 ? (
                        `${seconds}s`
                    ) : (
                        'Resend'
                    )}
                </YukuButton>
            </div>
        </div>
    );
};

export default InputOTP;
