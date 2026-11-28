import { LockOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
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
import { setCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { Button, Checkbox, Divider, Flex, Form, Tooltip } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import Title from 'antd/es/typography/Title';
import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
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
    scanQrHint: 'Thiết lập tài khoản mới trong ứng dụng xác thực của bạn và quét mã vạch QR sau',
});

const { secretId, userKinds } = AppConstants;
const GOOGLE_PROVIDER = 'GOOGLE';
const GOOGLE_GRANT_TYPE = 'google';

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
const LoginPage = () => {
    const intl = useIntl();
    const translate = useTranslate();
    const { isDark, toggleTheme } = useTheme();
    const themeLabel = translate.formatMessage(isDark ? message.lightMode : message.darkMode);
    const [loginData, setLoginData] = useState({});
    const [isOtp, setIsOtp] = useState(false);
    const [imgUrl, setImgUrl] = useState(null);
    // Google ID token: kept in component state only (never persisted), cleared on success / cancel
    const [googleIdToken, setGoogleIdToken] = useState(null);
    const [googleClientId, setGoogleClientId] = useState(null);
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
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });

    // Checked by default; the username field stays empty so the browser can list every saved account
    const [rememberLogin] = useState(() => getData(storageKeys.REMEMBER_LOGIN) !== false);

    useEffect(() => {
        executeGoogleConfig({
            params: { secretId },
            onCompleted: (res) => {
                const google = res?.data?.providers?.find((p) => p.provider === GOOGLE_PROVIDER);
                setGoogleClientId(google?.clientIds?.[0] || null);
            },
            onError: () => setGoogleClientId(null),
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
                    setGoogleIdToken(idToken);
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
        setGoogleIdToken(null);
        setLoginData({});
        setImgUrl(null);
        formOtp.resetFields();
        setIsOtp(false);
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
        const isGoogle = !!googleIdToken;

        const tokenParams = isGoogle
            ? { idToken: googleIdToken, grant_type: GOOGLE_GRANT_TYPE }
            : { ...credentials, grant_type: ADMIN_LOGIN_TYPE };

        execute({
            data: {
                ...tokenParams,
                secretId: secretId,
                userKind: userKinds[0],
                otp: otpValue,
            },
            onCompleted: (res) => {
                handleLoginSuccess(res, isGoogle ? {} : loginData);
            },
            onError: (error) => showApiError(error, intl, translate.formatMessage(message.loginOtpFail)),
        });
    };

    const handleLoginSuccess = (res, { username, password, remember }) => {
        setGoogleIdToken(null);
        // Google logins have no username/password: nothing to remember or hand to the password manager
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
            {!isOtp ? (
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
                        {googleClientId && (
                            <>
                                <Divider plain>{intl.formatMessage(message.or)}</Divider>
                                <Flex justify="center">
                                    <div ref={googleBtnRef} />
                                </Flex>
                            </>
                        )}
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
                                loading={loading || loadingGoogleVerify}
                                style={{ width: 'max-content' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyOtp();
                                }}
                                disabled={changeOtp == undefined || changeOtp == ''}
                            >
                                {intl.formatMessage(message.verify)}
                            </Button>
                            {googleIdToken && (
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

export default LoginPage;