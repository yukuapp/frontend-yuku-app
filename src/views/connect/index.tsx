import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useForm } from 'react-hook-form';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from 'i18next';
import { z } from 'zod';
import { IconLogoShiku } from '@/components/icons';
import message from '@/components/message';
import { YukuButton } from '@/components/ui/button';
import CloseIcon from '@/components/ui/close-icon';
import {
    Form,
    FormControl, // FormDescription,
    FormField,
    FormItem, // FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnectHooks } from '@/hooks/views/connect';
import {
    checkUserRegistered,
    loginEmail,
    registerEmail,
    sendCodeEmail,
} from '@/utils/apis/yuku/api';
import {
    readLastUsedType,
    UNITY_USER_TOKEN,
    writeLastConnectEmail,
    writeLastConnectType,
    writeLastUsedType,
    writeStorage,
    YUKU_USER_PERMISSIONS,
} from '@/utils/app/storage';
import { anonymous } from '@/utils/connect/anonymous';
import { cn } from '@/common/cn';
import { principal2account } from '@/common/ic/account';
import { justPreventLink } from '@/common/react/link';
import { useIdentityStore } from '@/stores/identity';
import { ConnectType } from '@/types/identity';
import InputOTP from './components/input-otp';
import PasswordTips, { ValidationResult } from './components/password-tips';

// wallet icons
const WALLET_ICONS: Record<ConnectType, [string, number]> = {
    plug: ['plug-login.svg', 0.95],
    infinity: ['bitfinity-login.svg', 0.8],
    ii: ['ic-login.svg', 1],
    me: ['me-login.svg', 1],
    nfid: ['nfid-login.svg', 1.05],
    stoic: ['stoic-login.png', 0.85],
};
const tabs: { value: string; label: string }[] = [
    { value: 'web3', label: 'Web3' },
    { value: 'email', label: 'Email' },
];

const checkingFormSchema = z.object({
    email: z.string().email('Please input valid email!'),
});

const passwordSchema = z
    .string()
    .min(8, { message: 'At least 8 letters' })
    .max(28, { message: 'Maximum 28 letters' })
    .regex(/^(?=.*[A-Z]).*$/, { message: 'At least 1 uppercase letter' })
    .regex(/[0-9]/, { message: 'At least 1 number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'At least 1 symbol' });

const registerFormSchema = z.object({
    email: z.string().email('Please input valid email!'),
    password: passwordSchema,
});

const loginFormSchema = z.object({
    email: z.string().email('Please input valid email!'),
    password: z.string(),
});
const codeSchema = z.string().length(6, { message: 'Please input 6 letters' });
const resetFormSchema = z.object({
    email: z.string().email('Please input valid email!'),
    password: passwordSchema,
    code: codeSchema,
});

function ConnectPage() {
    const navigate = useNavigate();
    const { records, onConnect } = useConnectHooks();
    const [connecting, setConnecting] = useState<boolean>();
    const [connectingWallet, setConnectingWallet] = useState<ConnectType>();
    const navigateType = useNavigationType();
    const identity = useIdentityStore((s) => s.connectedIdentity);

    useEffect(() => {
        if (identity && identity.connectType === 'email') {
            setConnecting(false);
            if (navigateType === 'POP') navigate('/');
            else navigate(-1);
        }
    }, [identity]);

    const [status, setStatus] = useState<
        | 'CHECKING'
        | 'REGISTERING'
        | 'VERIFYING_CODE'
        | 'REGISTER_SUCCESS'
        | 'RESET_PASSWORD'
        | 'LOGIN'
        | 'DONE'
        | undefined
    >();

    const checkingForm = useForm<z.infer<typeof checkingFormSchema>>({
        resolver: zodResolver(checkingFormSchema),
        defaultValues: {
            email: '',
        },
    });

    const [registered, setRegistered] = useState<boolean>(false);
    const [checkingRegistered, setCheckingRegistered] = useState<boolean>(false);

    const onCheckingSubmit = async (values: z.infer<typeof checkingFormSchema>) => {
        if (checkingRegistered) {
            return;
        }
        setCheckingRegistered(true);
        try {
            const registered = await checkUserRegistered(values.email);
            setStatus(registered ? 'LOGIN' : 'REGISTERING');
            setRegistered(!!registered);
            if (registered) {
                loginForm.setValue('email', values.email);
            } else {
                registerForm.setValue('email', values.email);
            }
        } catch (e: any) {
            message.error(JSON.parse(e.message).message);
        } finally {
            setCheckingRegistered(false);
        }
    };

    const registerForm = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
    });
    const [sendingCode, setSendingCode] = useState<boolean>(false);
    const [passwordFocus, setPasswordFocus] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [validationResults, setValidationResults] = useState<ValidationResult | undefined>();

    useEffect(() => {
        const pwd = registerForm.getValues().password;
        const result = passwordSchema.safeParse(pwd);
        pwd
            ? setValidationResults({
                  minMaxLength: pwd.length >= 8 && pwd.length <= 28,
                  includesUpperLetter: /^(?=.*[A-Z]).*$/.test(pwd),
                  includesNumber: /[0-9]/.test(pwd),
                  includesSpecialChar: /[^a-zA-Z0-9]/.test(pwd),
                  isValid: result.success,
              })
            : setValidationResults(undefined);
    }, [registerForm.watch('password')]);

    const onRegisterSubmit = async (values: z.infer<typeof registerFormSchema>) => {
        if (sendingCode) {
            return;
        }
        setSendingCode(true);
        try {
            const success = await sendCodeEmail({ email: values.email });
            setStatus(success ? 'VERIFYING_CODE' : 'REGISTERING');
        } catch (e: any) {
            const err = JSON.parse(e.message);
            if (err.code === 1001) {
                setStatus('VERIFYING_CODE');
            }
            message.error(err.message);
        } finally {
            setSendingCode(false);
        }
    };

    const [loggingIn, setLoggingIn] = useState<boolean>(false);
    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
    });
    const setConnectedIdentity = useIdentityStore((s) => s.setConnectedIdentity);

    const onLoginSubmit = async (values: z.infer<typeof loginFormSchema>, silence?: boolean) => {
        if (loggingIn) {
            return;
        }
        setLoggingIn(true);
        try {
            const r = await loginEmail({ email: values.email, password: values.password });
            setStatus(r ? 'DONE' : 'LOGIN');
            const icFound = r?.view.identity_list.find(
                (i) => i['EscrowInternetComputer']['network'] === 'Ic',
            );
            const principal = icFound && icFound['EscrowInternetComputer']['principal'];
            const hash = icFound && icFound['EscrowInternetComputer']['hash'];
            writeStorage(
                `${UNITY_USER_TOKEN}${values.email}`,
                JSON.stringify({
                    user_id: r?.user_id,
                    user_token: r?.token,
                }),
            );

            writeStorage(
                `${YUKU_USER_PERMISSIONS}${values.email}`,
                JSON.stringify(r?.view.permissions || []),
            );
            writeLastUsedType('email');
            writeLastConnectType('email');
            writeLastConnectEmail(values.email);

            setConnectedIdentity({
                connectType: 'email',
                creator: anonymous.creator,
                requestWhitelist: async () => true,
                main_email: values.email,
                user_id: r?.user_id,
                principal,
                account: principal && principal2account(principal),
                hash,
            });

            !silence && navigate('/');
        } catch (e: any) {
            message.error(e.message);
        } finally {
            setLoggingIn(false);
        }
    };

    const resetForm = useForm<z.infer<typeof resetFormSchema>>({
        resolver: zodResolver(resetFormSchema),
    });
    const [sendingCodeReset, setSendingCodeReset] = useState<boolean>(false);
    const [passwordFocusReset, setPasswordFocusReset] = useState<boolean>(false);
    const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);
    const [validationResultsReset, setValidationResultsReset] = useState<
        ValidationResult | undefined
    >();

    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        if (seconds === 0) return;

        const intervalId = setInterval(() => {
            setSeconds((seconds) => seconds - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [seconds]);

    useEffect(() => {
        const pwd = resetForm.getValues().password;
        const result = passwordSchema.safeParse(pwd);
        pwd
            ? setValidationResultsReset({
                  minMaxLength: pwd.length >= 8 && pwd.length <= 28,
                  includesUpperLetter: /^(?=.*[A-Z]).*$/.test(pwd),
                  includesNumber: /[0-9]/.test(pwd),
                  includesSpecialChar: /[^a-zA-Z0-9]/.test(pwd),
                  isValid: result.success,
              })
            : setValidationResultsReset(undefined);
    }, [resetForm.watch('password')]);

    const [codeValid, setCodeValid] = useState<boolean>(false);

    useEffect(() => {
        const code = resetForm.getValues().code;
        const result = codeSchema.safeParse(code);
        setCodeValid(result.success);
    }, [resetForm.watch('code')]);

    const [resetting, setResetting] = useState<boolean>();
    const onResetSendCode = async (e: any) => {
        justPreventLink(e);
        if (sendingCodeReset || seconds > 0) {
            return;
        }
        setSendingCodeReset(true);
        try {
            await sendCodeEmail({ email: resetForm.getValues('email') });
        } catch (e: any) {
            const err = JSON.parse(e.message);
            // if (err.code === 1004) {
            // }
            message.error(err.message);
        } finally {
            setSeconds(60);
            setSendingCodeReset(false);
        }
    };
    const onResetSubmit = async (values: z.infer<typeof resetFormSchema>) => {
        if (resetting) {
            return;
        }
        setResetting(true);
        try {
            await registerEmail({
                email: values.email,
                password: values.password,
                code: values.code,
            });
            setStatus('LOGIN');
            loginForm.setValue('email', values.email);
        } catch (e: any) {
            const err = JSON.parse(e.message);
            message.error(err.message);
        } finally {
            setResetting(false);
        }
    };
    return (
        <div className="absolute left-0 top-0 z-50 flex max-h-screen w-full bg-[#101522]">
            <IconLogoShiku
                className="absolute left-6 top-6 mb-[31px] h-[43px] w-[130px] flex-shrink-0 cursor-pointer bg-cover bg-center bg-no-repeat"
                onClick={() => navigate('/')}
            />
            <div
                className={cn(
                    'flex h-screen w-full flex-col justify-start px-[36px] pb-[93px] pt-[70px]  2xl:pt-[115px]',
                    isMobile && 'p-0 pt-[70px]',
                )}
            >
                <div className="flex w-full items-start justify-center gap-x-[260px]">
                    <div className={cn(' mt-[42px]', isMobile && 'ml-0')}>
                        <h2 className="font-inter-bold text-[32px] tracking-wide text-white">
                            Connect To Yuku
                        </h2>
                        <div
                            className={cn(
                                'mt-[14px] max-w-[420px] whitespace-pre text-[14px] leading-[24px] text-white/[.6] md:mt-[9px]',
                                isMobile && 'max-w-[300px] whitespace-pre-wrap',
                            )}
                        >
                            {t('home.connect.intro')}
                        </div>
                        <Tabs
                            defaultValue="web3"
                            onValueChange={() => {
                                setStatus(undefined);
                            }}
                            className={cn('mt-[49px] w-[400px]', isMobile && 'mt-5 w-[300px]')}
                        >
                            <TabsList className="flex w-full justify-start gap-x-[30px] rounded-none  border-b border-[#2A3043] bg-transparent">
                                {tabs.map((t) => (
                                    <TabsTrigger
                                        className="box-border rounded-none border-b-[2px] border-transparent px-0 font-inter-semibold text-lg text-white/60 data-[state=active]:border-white data-[state=active]:bg-transparent data-[state=active]:bg-none  data-[state=active]:text-white"
                                        value={t.value}
                                        key={t.value}
                                    >
                                        {t.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value="web3">
                                <div
                                    className={cn(
                                        'mt-[30px] h-[352px] w-[398px] overflow-hidden rounded-[24px] bg-[#1F2432] p-[36px]',
                                        isMobile && 'h-[260px] w-full p-[10px]',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'grid h-full w-full grid-cols-2 grid-rows-3 gap-px bg-[#282C38] ',
                                            isMobile && 'grid-rows-2',
                                        )}
                                    >
                                        {records.map((r) => (
                                            <div
                                                className="relative h-full w-full cursor-pointer items-center border-white/10 bg-[#1F2432] duration-300 hover:border-black hover:bg-[#283047]"
                                                key={r.type}
                                            >
                                                {r.type === 'plug' && (
                                                    <img
                                                        className="absolute left-6 top-4"
                                                        src={'/img/login/fire.svg'}
                                                    ></img>
                                                )}

                                                <button
                                                    className="relative flex h-full w-full flex-col items-center justify-center"
                                                    onClick={() => {
                                                        if (!connecting) {
                                                            onConnect(r.type);
                                                            setConnecting(true);
                                                            setConnectingWallet(r.type);
                                                        }
                                                    }}
                                                >
                                                    <div
                                                        className={
                                                            'flex h-[44px]   w-[44px] items-center justify-center'
                                                        }
                                                    >
                                                        <div
                                                            className={`flex h-[44px] w-[44px] items-center justify-center`}
                                                        >
                                                            <img
                                                                className={cn(
                                                                    connectingWallet === r.type &&
                                                                        connecting &&
                                                                        ' animate-spin ',
                                                                )}
                                                                src={`/img/login/${
                                                                    WALLET_ICONS[r.type][0]
                                                                }`}
                                                                alt=""
                                                            />
                                                        </div>
                                                        {readLastUsedType() === r.type && (
                                                            <div className="absolute -right-1 top-3 rounded bg-[#31394E] p-[5px] font-inter-medium text-xs leading-tight text-white">
                                                                Last Used
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-inter-bold text-[12px] text-white md:text-[14px]">
                                                        {t(`home.wallet.${r.type}`)}
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="email" className="mt-[30px]">
                                {!status || status === 'CHECKING' ? (
                                    <Form {...checkingForm} key={'CHECKING'}>
                                        <form
                                            onSubmit={checkingForm.handleSubmit(onCheckingSubmit)}
                                            className="space-y-8"
                                        >
                                            <FormField
                                                control={checkingForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        {/* <FormLabel>Username</FormLabel> */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Email Address"
                                                                className="border-[#3C3C3C] bg-[#1F2432]"
                                                                autoComplete="off"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <YukuButton
                                                type={
                                                    checkingForm.formState.isValid
                                                        ? 'CONFIRM'
                                                        : 'CANCEL'
                                                }
                                                onClick={() => {}}
                                                className={cn(
                                                    'flex w-full items-center',
                                                    !checkingForm.formState.isValid &&
                                                        'cursor-not-allowed',
                                                )}
                                            >
                                                Next{' '}
                                                {checkingRegistered ? (
                                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                                ) : (
                                                    <img
                                                        className="ml-[7px]"
                                                        src={'/img/login/arrow.svg'}
                                                        alt=""
                                                    />
                                                )}
                                            </YukuButton>
                                        </form>
                                    </Form>
                                ) : status === 'REGISTERING' ? (
                                    <Form {...registerForm} key={'REGISTERING'}>
                                        <form
                                            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                                            className="space-y-8"
                                        >
                                            <FormField
                                                control={registerForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        {/* <FormLabel>Username</FormLabel> */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Email Address"
                                                                className="border-[#3C3C3C] bg-[#1F2432]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={registerForm.control}
                                                name="password"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className="relative z-[100]">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Password"
                                                                    className="border-[#3C3C3C] bg-[#1F2432]"
                                                                    autoComplete="off"
                                                                    onFocus={() => {
                                                                        setPasswordFocus(true);
                                                                    }}
                                                                    type={
                                                                        showPassword
                                                                            ? 'text'
                                                                            : 'password'
                                                                    }
                                                                    {...field}
                                                                    onBlur={() => {
                                                                        setPasswordFocus(false);
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <div className="absolute right-3 top-[4px] flex h-4 items-center justify-between">
                                                                {showPassword ? (
                                                                    <EyeOutlined
                                                                        onClick={() => {
                                                                            setShowPassword(false);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <EyeInvisibleOutlined
                                                                        onClick={() => {
                                                                            setShowPassword(true);
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>

                                                            {passwordFocus && (
                                                                <PasswordTips
                                                                    validationResults={
                                                                        validationResults
                                                                    }
                                                                ></PasswordTips>
                                                            )}
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                            <YukuButton
                                                type={
                                                    registerForm.formState.isValid
                                                        ? 'CONFIRM'
                                                        : 'CANCEL'
                                                }
                                                onClick={() => {}}
                                                className={cn(
                                                    'flex w-full items-center',
                                                    !registerForm.formState.isValid &&
                                                        'cursor-not-allowed',
                                                )}
                                            >
                                                {registered ? 'Reset' : 'Sign up'}
                                                {sendingCode ? (
                                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                                ) : (
                                                    <img
                                                        className="ml-[7px]"
                                                        src={'/img/login/arrow.svg'}
                                                        alt=""
                                                    />
                                                )}
                                            </YukuButton>
                                        </form>
                                    </Form>
                                ) : status === 'VERIFYING_CODE' ? (
                                    <InputOTP
                                        pinLength={6}
                                        sendingCode={sendingCode}
                                        resend={async () => {
                                            await onRegisterSubmit({
                                                email: registerForm.watch('email'),
                                                password: registerForm.watch('password'),
                                            });
                                        }}
                                        registerForm={registerForm}
                                        prev={() => {
                                            setStatus('REGISTERING');
                                        }}
                                        next={() => {
                                            if (registered) {
                                                setStatus('LOGIN');
                                                loginForm.setValue('password', '');
                                            } else {
                                                setStatus('REGISTER_SUCCESS');
                                                onLoginSubmit(
                                                    {
                                                        email: registerForm.getValues('email'),
                                                        password:
                                                            registerForm.getValues('password'),
                                                    },
                                                    true,
                                                );
                                            }
                                        }}
                                    ></InputOTP>
                                ) : status === 'LOGIN' ? (
                                    <Form {...loginForm} key={'LOGIN'}>
                                        <form
                                            onSubmit={loginForm.handleSubmit((v) => {
                                                onLoginSubmit(v);
                                            })}
                                            className="space-y-8"
                                        >
                                            <FormField
                                                control={loginForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        {/* <FormLabel>Username</FormLabel> */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Email Address"
                                                                className="border-[#3C3C3C] bg-[#1F2432]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={loginForm.control}
                                                name="password"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem className="relative">
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Password"
                                                                    className="border-[#3C3C3C] bg-[#1F2432]"
                                                                    autoComplete="off"
                                                                    type={
                                                                        showPassword
                                                                            ? 'text'
                                                                            : 'password'
                                                                    }
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <div className="absolute right-3 top-[4px] flex h-4 items-center justify-between">
                                                                {showPassword ? (
                                                                    <EyeOutlined
                                                                        onClick={() => {
                                                                            setShowPassword(false);
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <EyeInvisibleOutlined
                                                                        onClick={() => {
                                                                            setShowPassword(true);
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                            <div
                                                className="!mt-3 ml-auto w-fit cursor-pointer self-end font-inter-medium text-sm text-white/60 hover:text-white"
                                                onClick={() => {
                                                    setStatus('RESET_PASSWORD');
                                                    resetForm.setValue(
                                                        'email',
                                                        loginForm.getValues('email'),
                                                    );
                                                }}
                                            >
                                                Forget Password?
                                            </div>
                                            <YukuButton
                                                type={
                                                    loginForm.formState.isValid
                                                        ? 'CONFIRM'
                                                        : 'CANCEL'
                                                }
                                                onClick={function (): void {}}
                                                className={cn(
                                                    'flex w-full items-center',
                                                    !loginForm.formState.isValid &&
                                                        'cursor-not-allowed',
                                                )}
                                            >
                                                Login
                                                {loggingIn ? (
                                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                                ) : (
                                                    <img
                                                        className="ml-[7px]"
                                                        src={'/img/login/arrow.svg'}
                                                        alt=""
                                                    />
                                                )}
                                            </YukuButton>
                                        </form>
                                    </Form>
                                ) : status === 'RESET_PASSWORD' ? (
                                    <Form {...resetForm} key={'RESET_PASSWORD'}>
                                        <form
                                            onSubmit={resetForm.handleSubmit(onResetSubmit)}
                                            className="space-y-8"
                                        >
                                            <FormField
                                                control={resetForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        {/* <FormLabel>Username</FormLabel> */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Email Address"
                                                                className="border-[#3C3C3C] bg-[#1F2432]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={resetForm.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem className="relative">
                                                        {/* <FormLabel>Username</FormLabel> */}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Verification Code"
                                                                className="border-[#3C3C3C] bg-[#1F2432]"
                                                                {...field}
                                                            />
                                                        </FormControl>

                                                        <YukuButton
                                                            type={'CONFIRM'}
                                                            onClick={onResetSendCode}
                                                            className="absolute right-0 top-0 !mt-0 h-full w-16 rounded-none rounded-r-[4px] bg-transparent font-inter-medium !text-shiku hover:bg-transparent"
                                                        >
                                                            {sendingCodeReset ? (
                                                                <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                                            ) : seconds ? (
                                                                `${seconds}s`
                                                            ) : (
                                                                'Send'
                                                            )}
                                                        </YukuButton>
                                                    </FormItem>
                                                )}
                                            />
                                            {codeValid && (
                                                <FormField
                                                    control={resetForm.control}
                                                    name="password"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem className="relative z-[100]">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="New Password"
                                                                        className="border-[#3C3C3C] bg-[#1F2432]"
                                                                        autoComplete="off"
                                                                        onFocus={() => {
                                                                            setPasswordFocusReset(
                                                                                true,
                                                                            );
                                                                        }}
                                                                        type={
                                                                            showPasswordReset
                                                                                ? 'text'
                                                                                : 'password'
                                                                        }
                                                                        {...field}
                                                                        onBlur={() => {
                                                                            setPasswordFocusReset(
                                                                                false,
                                                                            );
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <div className="absolute right-3 top-[4px] flex h-4 items-center justify-between">
                                                                    {showPasswordReset ? (
                                                                        <EyeOutlined
                                                                            onClick={() => {
                                                                                setShowPasswordReset(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <EyeInvisibleOutlined
                                                                            onClick={() => {
                                                                                setShowPasswordReset(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>

                                                                {passwordFocusReset && (
                                                                    <PasswordTips
                                                                        validationResults={
                                                                            validationResultsReset
                                                                        }
                                                                    ></PasswordTips>
                                                                )}
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            )}
                                            <YukuButton
                                                type={
                                                    resetForm.formState.isValid
                                                        ? 'CONFIRM'
                                                        : 'CANCEL'
                                                }
                                                onClick={() => {}}
                                                className={cn(
                                                    'flex w-full items-center',
                                                    !resetForm.formState.isValid &&
                                                        'cursor-not-allowed',
                                                )}
                                            >
                                                {'Reset'}
                                                {resetting ? (
                                                    <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                                ) : (
                                                    <img
                                                        className="ml-[7px]"
                                                        src={'/img/login/arrow.svg'}
                                                        alt=""
                                                    />
                                                )}
                                            </YukuButton>
                                        </form>
                                    </Form>
                                ) : (
                                    <div className="!mt-[60px] flex flex-col items-center justify-between gap-y-10">
                                        <img src={'/img/market/success.svg'} alt="" />
                                        <div className="text-center font-inter-semibold text-2xl leading-loose text-white">
                                            Registered successfully
                                        </div>
                                        <YukuButton
                                            className="w-full"
                                            type={'CONFIRM'}
                                            onClick={() => {
                                                !loggingIn && navigate('/');
                                            }}
                                        >
                                            Enter
                                            {loggingIn && (
                                                <LoadingOutlined className="ml-[7px]"></LoadingOutlined>
                                            )}
                                        </YukuButton>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                    <img
                        src={'/img/login/metaverse.png'}
                        className={cn(
                            'mt-[40px] hidden h-[600px] xl:block 2xl:h-[800px]',
                            isMobile && 'hidden',
                        )}
                        alt=""
                    />
                </div>
            </div>
            <div
                className="group absolute right-[27px] top-[27px] hidden h-[17px] w-[17px] cursor-pointer bg-contain md:block"
                onClick={() => navigate(-1)}
            >
                <CloseIcon></CloseIcon>
            </div>
        </div>
    );
}

export default ConnectPage;
