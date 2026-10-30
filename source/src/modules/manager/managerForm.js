import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, BooleanField, CropImageField, SelectField, TextField } from '@components/cms';
import { Card, Col, Form, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

dayjs.extend(customParseFormat);

const PASSWORD_RULES = {
    minLength: 8,
    specialChars: '@$!%*?&',
};

const PASSWORD_REGEX = new RegExp(
    `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[${PASSWORD_RULES.specialChars}])[A-Za-z\\d${PASSWORD_RULES.specialChars}]{${PASSWORD_RULES.minLength},}$`,
);

const ManagerForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [appId, setAppId] = useState(0);
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const uploadFile = (file, onSuccess, onError, setImageUrl) => {
        executeUpFile({
            data: {
                type: 'AVATAR',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    setAvatarUrl(response.data.filePath);
                    setImageUrl(response.data.filePath);
                    setIsChangedFormValues(true);
                }
            },
            onError: (error) => {
                onError();
            },
        });
    };

    const handleSubmit = (values) => {

        delete values.authennewpassword;
        values.kind = 1;
        values.avatarPath = avatarUrl;
        return mixinFuncs.handleSubmit(values);
    };
    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
                isChangePassword: true,
            });
        }
    }, [isEditing]);
    useEffect(() => {
       
        form.setFieldsValue({
            ...dataDetail,
            groupId: dataDetail?.group?.id,
        });
        setAvatarUrl(dataDetail?.avatarPath);
    }, [dataDetail]);

    const checkEmail = (_, value) => {
        if (value) {
            const emailRegex = /^[A-Za-z0-9.]{1,64}@[A-Za-z0-9.]{1,255}\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(value)) {
                return Promise.reject('Email không hợp lệ, vui lòng nhập lại');
            }
        }
        return Promise.resolve();
    };
    const checkPhone = (_, value) => {
        if (value) {
            const phoneRegex = /^0[0-9]{9}$/;
            if (!phoneRegex.test(value)) {
                return Promise.reject('Số điện thoại không hợp lệ, vui lòng nhập lại');
            }
        }
        return Promise.resolve();
    };
    const isChangePassword = Form.useWatch('isChangePassword', form);
    const password = Form.useWatch('password', form);

    useEffect(() => {
        if (isChangePassword !== undefined && password !== undefined) {
            form.validateFields(['password']);
        }
    }, [isChangePassword]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Avatar" />}
                            name="avatarPath"
                            imageUrl={avatarUrl && `${AppConstants.contentRootUrl}${avatarUrl}`}
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setAvatarUrl)}
                        />
                    </Col>
                </Row>

                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            name="username"
                            label={
                                <FormattedMessage
                                    defaultMessage="Tên đăng nhập"
                                    description=""
                                    id="source.src.modules.manager.index.userName"
                                />
                            }
                            required
                            // disabled={isEditing}
                        />
                    </Col>

                    <Col span={12}>
                        <TextField
                            name="fullName"
                            label={
                                <FormattedMessage
                                    defaultMessage="Họ và tên"
                                    description=""
                                    id="source.src.modules.manager.index.fullName"
                                />
                            }
                            required
                        />
                    </Col>
                </Row>
                {/* <Col span={12}>
                        <TextField
                            name="authennewpassword"
                            label={<FormattedMessage defaultMessage="Xác thực mật khẩu mới" />}
                        />
                    </Col> */}
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            required={!isEditing}
                            name="password"
                            type="password"
                            label={
                                <FormattedMessage
                                    defaultMessage="Mật khẩu mới"
                                    description=""
                                    id="source.src.modules.manager.managerForm.newPass"
                                />
                            }
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();

                                        // changePassword = false => check password mạnh
                                        if (isChangePassword === false && !PASSWORD_REGEX.test(value)) {
                                            return Promise.reject(
                                                new Error(
                                                    'Mật khẩu phải tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
                                                ),
                                            );
                                        }

                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            name="email"
                            label={<FormattedMessage defaultMessage="Email" />}
                            rules={[
                                {
                                    validator: checkEmail,
                                },
                            ]}
                        />
                    </Col>

                    <Col span={12}>
                        <TextField
                            name="phone"
                            label={
                                <FormattedMessage
                                    defaultMessage="Số điện thoại"
                                    description=""
                                    id="source.src.modules.manager.managerForm.phone"
                                />
                            }
                            rules={[
                                {
                                    validator: checkPhone,
                                },
                            ]}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Tình trạng" />}
                            name="status"
                            options={statusValues}
                            disabled={!isEditing}
                        />
                    </Col>
                    <Row gutter={10}>
                        <Col span={24} style={{ display: 'flex', alignItems: 'center' }}>
                            <BooleanField
                                name="isChangePassword"
                                label=""
                                formItemProps={{
                                    noStyle: true,
                                }}
                                style={{
                                    width: 'auto',
                                }}
                            />
    
                            <span style={{ marginLeft: 8 }}>
                                <FormattedMessage defaultMessage="Yêu cầu đổi mật khẩu khi đăng nhập" />
                            </span>
                        </Col>
                    </Row>
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default ManagerForm;
