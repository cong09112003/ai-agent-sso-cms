import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ADMIN_LOGIN_TYPE, appAccount, AppConstants, brandName, storageKeys } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import useTranslate from '@hooks/useTranslate';
import { TextField } from '@components/cms';
import { setData } from '@utils';
import { commonMessage } from '@locales/intl';
import { showErrorMessage } from '@services/notifyService';
import { setCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { Button, Flex, Form } from 'antd';
import { useWatch } from 'antd/es/form/Form';
import Title from 'antd/es/typography/Title';
import { Buffer } from 'buffer';
import React, { useState } from 'react';
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
});

const { secretId, userKinds } = AppConstants;
const LoginPage = () => {
    const intl = useIntl();
    const translate = useTranslate();
    const [loginData, setLoginData] = useState({}); 
    const [isOtp, setIsOtp] = useState(false);
    const [imgUrl, setImgUrl] = useState(null);
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
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile, {
        loading: useFetchAction.LOADING_TYPE.APP,
    });

    const onFinish = (values) => {
        setLoginData(values);
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
                            handleLoginSuccess(res);
                        },
                        onError: () => showErrorMessage(translate.formatMessage(message.loginOtpFail)),
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
            onError: () => showErrorMessage(translate.formatMessage(message.loginFail)),
        });
    };

    const handleVerifyOtp = () => {
        const otpValue = formOtp.getFieldValue('otp');

        execute({
            data: { 
                ...loginData,
                secretId: secretId,
                userKind: userKinds[0],
                grant_type: ADMIN_LOGIN_TYPE, 
                otp: otpValue, 
            },
            onCompleted: (res) => {
                handleLoginSuccess(res);
            },
            onError: () => showErrorMessage(translate.formatMessage(message.loginOtpFail)),
        });
    };

    const handleLoginSuccess = (res) => {
        setCacheAccessToken(res?.access_token);
        setData(storageKeys.USER_KIND, res?.user_kind);
        setData(storageKeys.IS_MFA_ENABLE, res?.isMfaEnable);
        executeGetProfile({ kind: res.user_kind });
    };

    return (
        <div className={styles.loginPage}>
            {!isOtp ? (
                <div className={styles.loginForm}>
                    <Title level={2}>{intl.formatMessage(commonMessage.login).toUpperCase()}</Title>
                    <Form
                        name="login-form"
                        onFinish={onFinish}
                        initialValues={{
                            username: '',
                            password: '',
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
                        />
                        <TextField
                            name="password"
                            fieldProps={{ prefix: <LockOutlined /> }}
                            placeholder={intl.formatMessage(commonMessage.password)}
                            size="large"
                            required
                            type="password"
                        />

                        <Button
                            type="primary"
                            size="large"
                            loading={loadingLogin || loading}
                            htmlType="submit"
                            style={{ width: '100%', marginTop: 6 }}
                        >
                            {intl.formatMessage(commonMessage.login)}
                        </Button>
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
                                    Quét Mã vạch QR
                                </Title>
                                <span style={{ opacity: '0.6', fontSize: 14 }}>
                                    Thiết lập tài khoản mới trong ứng dụng xác thực của bạn và quét mã vạch QR sau
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
                                loading={loading}
                                style={{ width: 'max-content' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleVerifyOtp();
                                }}
                                disabled={changeOtp == undefined || changeOtp == ''}
                            >
                                {intl.formatMessage(message.verify)}
                            </Button>
                        </Flex>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default LoginPage;