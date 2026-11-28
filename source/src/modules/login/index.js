import { GithubOutlined, LockOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import { ADMIN_LOGIN_TYPE, appAccount, AppConstants, brandName, storageKeys } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import useGoogleIdentity from '@hooks/useGoogleIdentity';
import useLocale from '@hooks/useLocale';
import useTheme from '@hooks/useTheme';
import useTranslate from '@hooks/useTranslate';
import { TextField } from '@components/cms';
import LanguageSwitcher from '@components/common/LanguageSwitcher';
import { getData, setData } from '@utils';
import { commonMessage } from '@locales/intl';
import { showApiError } from '@utils/apiError';
import { showErrorMessage } from '@services/notifyService';
import { setCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { Button, Checkbox, Divider, Flex, Form, Spin, Tooltip } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import Title from 'antd/es/typography/Title';
import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.scss';
window.Buffer = window.Buffer || Buffer;
const message = defineMessages({
    copyRight: '{brandName} - © Copyright {year}. All Rights Reserved',
    loginFail: 'Sai tên đăng nhập hoặc mật khẩu !!!',
    loginOtpFail: 'Mã OTP không hợp  lệ !',
    loginSuccess: 'Đăng nhập thành công !',
    verify: 'Xác nhận',
    cancel: 'Hủy',
    remember: 'Ghi nhớ đăng nhập',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    scanQrTitle: 'Quét mã vạch QR',
    or: 'hoặc',
    googleLoginFail: 'Đăng nhập Google thất bại',
    githubLoginFail: 'Đăng nhập GitHub thất bại',
    socialLoginSessionInvalid: 'Phiên đăng nhập GitHub không hợp lệ hoặc đã hết hạn, vui lòng thử lại',
    orSignInWith: 'Hoặc đăng nhập bằng',
    googleNotConfigured:
        'Ứng dụng chưa bật đăng nhập Google — quản trị viên cấu hình tại Quản lí ứng dụng → Đăng nhập mạng xã hội',
    githubNotConfigured:
        'Ứng dụng chưa bật đăng nhập GitHub — quản trị viên cấu hình tại Quản lí ứng dụng → Đăng nhập mạng xã hội',
    githubSigningIn: 'Đang đăng nhập bằng GitHub...',
    googleLabel: 'Đăng nhập bằng Google',
    githubLabel: 'Đăng nhập bằng GitHub',
    scanQrHint: 'Thiết lập tài khoản mới trong ứng dụng xác thực của bạn và quét mã vạch QR sau',
});

const { secretId, userKinds } = AppConstants;
const GOOGLE_PROVIDER = 'GOOGLE';
const GITHUB_PROVIDER = 'GITHUB';
const GOOGLE_GRANT_TYPE = 'google';
const GITHUB_GRANT_TYPE = 'github';
const GITHUB_STATE_KEY = 'github_oauth_state';
const GITHUB_STATE_TTL = 10 * 60 * 1000;
const GITHUB_CALLBACK_PATH = '/login/github/callback';

const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
        <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
);

const randomHex = (bytes = 16) =>
    Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, '0')).join('');

// GitHub OAuth: random `state` kept in sessionStorage (with clientId + timestamp), checked again on the callback page
const startGithubLogin = (clientId) => {
    const state = randomHex();
    try {
        sessionStorage.setItem(GITHUB_STATE_KEY, JSON.stringify({ state, clientId, ts: Date.now() }));
    } catch (e) {
        return false;
    }
    const redirectUri = encodeURIComponent(window.location.origin + GITHUB_CALLBACK_PATH);
    window.location.assign(
        `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}&scope=read:user%20user:email&state=${state}&allow_signup=false`,
    );
    return true;
};

// One-shot: returns the stored state and deletes it
const readGithubState = () => {
    try {
        const stored = JSON.parse(sessionStorage.getItem(GITHUB_STATE_KEY));
        sessionStorage.removeItem(GITHUB_STATE_KEY);
        return stored;
    } catch (e) {
        return null;
    }
};

// Asks the browser's password manager to save the credentials (Chrome/Edge show a "Save password?" prompt).
// Other browsers fall back to their own form detection. The app itself never stores the password.
const storeBrowserCredential = async ({ username, password }) => {
    if (!window.PasswordCredential || !navigator.credentials?.store) return;
    try {
        await navigator.credentials.store(new window.PasswordCredential({ id: username, password, name: username }));
    } catch (e) {
        // The user dismissed the prompt or the browser blocked it; login is unaffected
    }
};
const LoginPage = ({ githubCallback = false }) => {
    const intl = useIntl();
    const navigate = useNavigate();
    const translate = useTranslate();
    const { isDark, toggleTheme } = useTheme();
    const themeLabel = translate.formatMessage(isDark ? message.lightMode : message.darkMode);
    const [loginData, setLoginData] = useState({});
    const [isOtp, setIsOtp] = useState(false);
    const [imgUrl, setImgUrl] = useState(null);
    // Pending social credentials ({ grant_type, idToken } or { grant_type, socialTicket }): component state only,
    // never persisted; cleared on success / cancel
    const [socialCreds, setSocialCreds] = useState(null);
    const [googleClientId, setGoogleClientId] = useState(null);
    const [githubClientId, setGithubClientId] = useState(null);
    const [socialLoaded, setSocialLoaded] = useState(false);
    const callbackRan = useRef(false);
    const googleBtnRef = useRef(null);
    const { locale } = useLocale();
    const [formOtp] = Form.useForm();
    const [form] = Form.useForm();

    const changeOtp = useWatch('otp', formOtp);

    const base64Credentials = Buffer.from(`${appAccount.APP_USERNAME}:${appAccount.APP_PASSWORD}`).toString('base64');
    const { execute, loading } = useFetch({
        ...apiConfig.account.loginBasic,
        authorization: `Basic ${base64Credentials}`,
    });
    const { execute: executeLogin, loading: loadingLogin } = useFetch({
        ...apiConfig.account.loginSso,
        authorization: `Basic ${base64Credentials}`,
    });
    const { execute: executeGoogleConfig } = useFetch(apiConfig.socialAuth.config);
    const { execute: executeGoogleVerify, loading: loadingGoogleVerify } = useFetch(apiConfig.socialAuth.googleVerify);
    const { execute: executeGithubVerify, loading: loadingGithubVerify } = useFetch(apiConfig.socialAuth.githubVerify);
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });

    // Checked by default; the username field stays empty so the browser can list every saved account
    const [rememberLogin] = useState(() => getData(storageKeys.REMEMBER_LOGIN) !== false);

    useEffect(() => {
        if (githubCallback) return;
        executeGoogleConfig({
            params: { secretId },
            onCompleted: (res) => {
                const providers = res?.data?.providers || [];
                setGoogleClientId(providers.find((p) => p.provider === GOOGLE_PROVIDER)?.clientIds?.[0] || null);
                setGithubClientId(providers.find((p) => p.provider === GITHUB_PROVIDER)?.clientIds?.[0] || null);
                setSocialLoaded(true);
            },
            onError: () => {
                setGoogleClientId(null);
                setGithubClientId(null);
                setSocialLoaded(true);
            },
        });
    }, []);

    // GitHub redirects back to /login/github/callback?code&state: validate state, verify code, then token/OTP
    useEffect(() => {
        if (!githubCallback || callbackRan.current) return;
        callbackRan.current = true;
        const failBack = (error) => {
            if (error) showApiError(error, intl, translate.formatMessage(message.githubLoginFail));
            else showErrorMessage(translate.formatMessage(message.socialLoginSessionInvalid));
            navigate('/login', { replace: true });
        };
        const query = new URLSearchParams(window.location.search);
        const code = query.get('code');
        const state = query.get('state');
        const stored = readGithubState();
        // The one-time code must not stay in the address bar / history
        window.history.replaceState(null, '', window.location.pathname);
        if (
            query.get('error') ||
            !code ||
            !state ||
            !stored?.state ||
            stored.state !== state ||
            !stored.clientId ||
            Date.now() - Number(stored.ts) > GITHUB_STATE_TTL
        ) {
            failBack();
            return;
        }
        executeGithubVerify({
            data: {
                code,
                redirectUri: window.location.origin + GITHUB_CALLBACK_PATH,
                clientId: stored.clientId,
                secretId: secretId,
                userKind: userKinds[0],
            },
            onCompleted: (res) => {
                const { data } = res;
                const creds = { grant_type: GITHUB_GRANT_TYPE, socialTicket: data?.socialTicket };
                if (!data?.isMfaEnable) {
                    execute({
                        data: { ...creds, secretId: secretId, userKind: userKinds[0] },
                        onCompleted: (tokenRes) => handleLoginSuccess(tokenRes, {}),
                        onError: failBack,
                    });
                } else {
                    setSocialCreds(creds);
                    setIsOtp(true);
                    setImgUrl(data.isMfa == true ? null : data?.qrUrl);
                }
            },
            onError: failBack,
        });
    }, []);

    const handleGoogleCredential = (idToken) => {
        executeGoogleVerify({
            data: { idToken, secretId: secretId, userKind: userKinds[0] },
            onCompleted: (res) => {
                const { data } = res;
                if (!data?.isMfaEnable) {
                    execute({
                        data: { idToken, secretId: secretId, userKind: userKinds[0], grant_type: GOOGLE_GRANT_TYPE },
                        onCompleted: (tokenRes) => handleLoginSuccess(tokenRes, {}),
                        onError: (error) => showApiError(error, intl, translate.formatMessage(message.googleLoginFail)),
                    });
                } else {
                    setSocialCreds({ grant_type: GOOGLE_GRANT_TYPE, idToken });
                    setIsOtp(true);
                    setImgUrl(data.isMfa == true ? null : data?.qrUrl);
                }
            },
            onError: (error) => showApiError(error, intl, translate.formatMessage(message.googleLoginFail)),
        });
    };

    useGoogleIdentity({
        clientId: googleClientId,
        active: !isOtp,
        locale,
        dark: isDark,
        onCredential: handleGoogleCredential,
        containerRef: googleBtnRef,
    });

    const handleCancelOtp = () => {
        setSocialCreds(null);
        setLoginData({});
        setImgUrl(null);
        formOtp.resetFields();
        setIsOtp(false);
        if (githubCallback) navigate('/login', { replace: true });
    };

    const onFinish = ({ remember, ...values }) => {
        setLoginData({ ...values, remember });
        executeLogin({
            data: {
                secretId: secretId,
                userKind: userKinds[0],
                grant_type: ADMIN_LOGIN_TYPE,
                ...values,
            },
            onCompleted: (res) => {
                const { data } = res;
                if (!data?.isMfaEnable) {
                    execute({
                        data: { 
                            ...values,
                            secretId: secretId,
                            userKind: userKinds[0],
                            grant_type: ADMIN_LOGIN_TYPE, 
                        },
                        onCompleted: (res) => {
                            handleLoginSuccess(res, { ...values, remember });
                        },
                        onError: (error) => showApiError(error, intl, translate.formatMessage(message.loginOtpFail)),
                    });
                } else {
                    if (data.isMfa == true) {
                        setIsOtp(true);
                    } else {
                        setIsOtp(true);
                        setImgUrl(data?.qrUrl);
                    }
                }
            },
            onError: (error) => showApiError(error, intl, translate.formatMessage(message.loginFail)),
        });
    };

    const handleVerifyOtp = () => {
        const otpValue = formOtp.getFieldValue('otp');
        const { remember, ...credentials } = loginData;
        const isSocial = !!socialCreds;

        const tokenParams = isSocial ? socialCreds : { ...credentials, grant_type: ADMIN_LOGIN_TYPE };

        execute({
            data: {
                ...tokenParams,
                secretId: secretId,
                userKind: userKinds[0],
                otp: otpValue,
            },
            onCompleted: (res) => {
                handleLoginSuccess(res, isSocial ? {} : loginData);
            },
            onError: (error) => showApiError(error, intl, translate.formatMessage(message.loginOtpFail)),
        });
    };

    const handleLoginSuccess = (res, { username, password, remember }) => {
        setSocialCreds(null);
        // Social logins have no username/password: nothing to remember or hand to the password manager
        if (username && password) {
            setData(storageKeys.REMEMBER_LOGIN, !!remember);
            if (remember) {
                storeBrowserCredential({ username, password });
            }
        }
        setCacheAccessToken(res?.access_token);
        setData(storageKeys.USER_KIND, res?.user_kind);
        setData(storageKeys.IS_MFA_ENABLE, res?.isMfaEnable);
        executeGetProfile({ kind: res.user_kind });
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.topActions}>
                <LanguageSwitcher />
                <Tooltip title={themeLabel} placement="left">
                    <Button
                        shape="circle"
                        aria-label={themeLabel}
                        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                        onClick={toggleTheme}
                    />
                </Tooltip>
            </div>
            {!isOtp && githubCallback ? (
                <div className={styles.loginForm}>
                    <Flex vertical align="center" gap={16} style={{ padding: '24px 0' }}>
                        <Spin size="large" />
                        <span>{intl.formatMessage(message.githubSigningIn)}</span>
                    </Flex>
                </div>
            ) : !isOtp ? (
                <div className={styles.loginForm}>
                    <Title level={2}>{intl.formatMessage(commonMessage.login).toUpperCase()}</Title>
                    <Form
                        name="login-form"
                        onFinish={onFinish}
                        initialValues={{
                            username: '',
                            password: '',
                            remember: rememberLogin,
                        }}
                        layout="vertical"
                        form={form}
                    >
                        <TextField
                            name="username"
                            fieldProps={{ prefix: <UserOutlined /> }}
                            placeholder={intl.formatMessage(commonMessage.username)}
                            size="large"
                            required
                            autoComplete="username"
                        />
                        <TextField
                            name="password"
                            fieldProps={{ prefix: <LockOutlined /> }}
                            placeholder={intl.formatMessage(commonMessage.password)}
                            size="large"
                            required
                            type="password"
                            autoComplete="current-password"
                        />
                        <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 12 }}>
                            <Checkbox>{intl.formatMessage(message.remember)}</Checkbox>
                        </Form.Item>

                        <Button
                            type="primary"
                            size="large"
                            loading={loadingLogin || loading}
                            htmlType="submit"
                            style={{ width: '100%', marginTop: 6 }}
                        >
                            {intl.formatMessage(commonMessage.login)}
                        </Button>
                        <Divider plain>{intl.formatMessage(message.orSignInWith)}</Divider>
                        <Flex justify="center" align="center" gap={16} style={{ minHeight: 40 }}>
                            {googleClientId ? (
                                <div ref={googleBtnRef} aria-label={intl.formatMessage(message.googleLabel)} />
                            ) : (
                                <Tooltip title={socialLoaded ? intl.formatMessage(message.googleNotConfigured) : ''}>
                                    <span>
                                        <Button
                                            shape="circle"
                                            size="large"
                                            disabled
                                            aria-label={intl.formatMessage(message.googleLabel)}
                                            icon={<GoogleLogo />}
                                        />
                                    </span>
                                </Tooltip>
                            )}
                            <Tooltip
                                title={socialLoaded && !githubClientId ? intl.formatMessage(message.githubNotConfigured) : ''}
                            >
                                <span>
                                    <Button
                                        shape="circle"
                                        size="large"
                                        disabled={!githubClientId}
                                        aria-label={intl.formatMessage(message.githubLabel)}
                                        icon={<GithubOutlined />}
                                        onClick={() => {
                                            if (!startGithubLogin(githubClientId)) {
                                                showErrorMessage(intl.formatMessage(message.githubLoginFail));
                                            }
                                        }}
                                    />
                                </span>
                            </Tooltip>
                        </Flex>
                        <center className="s-mt4px">
                            <small>
                                {intl.formatMessage(message.copyRight, { brandName, year: new Date().getFullYear() })}
                            </small>
                        </center>
                    </Form>
                </div>
            ) : (
                <div>
                    <Title level={2} style={{ textAlign: 'center' }}>{intl.formatMessage(commonMessage.authentication).toUpperCase()}</Title>
                    {imgUrl != null && (
                        <Flex align="center" vertical gap={18} style={{ marginBottom: 24 }}>
                            <div>
                                <Title level={4} style={{ margin: '0 0 4px 0' }}>
                                    {intl.formatMessage(message.scanQrTitle)}
                                </Title>
                                <span style={{ opacity: '0.6', fontSize: 14 }}>
                                    {intl.formatMessage(message.scanQrHint)}
                                </span>
                            </div>
                            <img src={imgUrl} style={{ width: 240, height: 240 }} />
                        </Flex>
                    )}
                    <Form form={formOtp} name="otp-form" layout="vertical">
                        <Flex justify="end" gap={8} style={{ marginTop: 24 }}>
                            <div style={{ flex: 1 }}>
                                <TextField
                                    name="otp"
                                    fieldProps={{ prefix: <LockOutlined /> }}
                                    placeholder={intl.formatMessage(commonMessage.otp)}
                                    size="large"
                                    required
                                    onPressEnter={(e) => {
                                        e.stopPropagation();
                                        handleVerifyOtp();
                                    }}
                                    autoFocus={true}
                                />
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                loading={loading || loadingGoogleVerify || loadingGithubVerify}
                                style={{ width: 'max-content' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyOtp();
                                }}
                                disabled={changeOtp == undefined || changeOtp == ''}
                            >
                                {intl.formatMessage(message.verify)}
                            </Button>
                            {socialCreds && (
                                <Button size="large" onClick={handleCancelOtp}>
                                    {intl.formatMessage(message.cancel)}
                                </Button>
                            )}
                        </Flex>
                    </Form>
                </div>
            )}
        </div>
    );
};

export const GithubCallbackPage = () => <LoginPage githubCallback />;

export default LoginPage;