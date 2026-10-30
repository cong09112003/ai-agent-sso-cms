import { AppConstants, STATUS_ACTIVE } from '@constants';
import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, CropImageField, SelectField, TextField } from '@components/cms';
import { commonMessage } from '@locales/intl';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import SettingsModal from '../../SettingModal';
import { checkEmail, checkPhone } from '@utils';
dayjs.extend(customParseFormat);

const NewAccountAppForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const [arraySetting, setArraySetting] = useState([]);
    const location = useLocation();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
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
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');
    const userKindId = queryParams.get('userKindId');

    const { data: dataRoles } = useFetch(apiConfig.role.autocomplete, {
        immediate: true,
        params: { appId, userKindId },
        mappingData: ({ data }) => {
            const dataCustom = data.content.map((item) => {
                return {
                    value: item.id,
                    label: item.name,
                };
            });
            return dataCustom;
        },
    });

    const convertArrayToJson = (array) => {
        return array.reduce((acc, item) => {
            acc[item.key] = isNaN(item.value) || typeof item.value === 'boolean' ? item.value : Number(item.value);
            return acc;
        }, {});
    };

    const handleSubmit = (values) => {
        const settings = convertArrayToJson(arraySetting);
        const jsonString = JSON.stringify(settings);
        const finalValues = {
            ...values,
            accountInfo: {
                username: values.username,
                fullName: values.fullName,
                password: values.password,
                email: values.email,
                phone: values.phone,
                avatarPath: avatarUrl, 
                status: STATUS_ACTIVE,
            },
            appId,
            userKindId,
            settings: jsonString,
        };

        return mixinFuncs.handleSubmit(finalValues);
    };

    useEffect(() => {
        form.setFieldsValue({
            status: STATUS_ACTIVE,
        });
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <fieldset style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    position: 'relative',
                }}>
                    <legend style={{
                        width: 'auto',
                        padding: '0 10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1890ff',
                        marginBottom: 0,
                        borderBottom: "none",
                    }}>
                        <FormattedMessage defaultMessage="Thông tin cá nhân" />
                    </legend>
                    <Row gutter={10}>
                        <Col span={24}>
                            <CropImageField
                                label={<FormattedMessage defaultMessage="Avatar" />}
                                name="avatarPath"
                                imageUrl={avatarUrl && `${AppConstants.contentRootUrl}${avatarUrl}`}
                                aspect={1 / 1}
                                uploadFile={(...args) => uploadFile(...args, setAvatarUrl)}
                            />
                        </Col>

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
                                        validator: async () => {
                                            const isTouched = form.isFieldTouched('password');
                                            if (isTouched) {
                                                const value = form.getFieldValue('password');
                                                if (value.length < 6) {
                                                    throw new Error(
                                                        translate.formatMessage(commonMessage.validatePassword),
                                                    );
                                                }
                                            }
                                        },
                                    },
                                ]}
                            />
                        </Col>
                        <Col span={12}>
                            <TextField
                                name="email"
                                label="email"
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
                                label="Số điện thoại"
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
                    
                    </Row>
                </fieldset>
                <fieldset style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    position: 'relative',
                }}>
                    <legend style={{
                        width: 'auto',
                        padding: '0 10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1890ff',
                        marginBottom: 0,
                        borderBottom: "none",
                    }}>
                        <FormattedMessage defaultMessage="Phân quyền tài khoản" />
                    </legend>
                    <Row gutter={10}>
                        <Col span={12}>
                            <SelectField
                                required
                                label={<FormattedMessage defaultMessage="Quyền hạn" />}
                                name={['roleId']}
                                options={dataRoles}
                                allowClear={false}
                            />
                        </Col>
                    </Row>
                    <SettingsModal
                        arraySetting={arraySetting}
                        setArraySetting={setArraySetting}
                        setIsChangedFormValues={setIsChangedFormValues}
                    />
                </fieldset>
                <div className="footer-card-form" style={{ marginTop: 15 }}>{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default NewAccountAppForm;
