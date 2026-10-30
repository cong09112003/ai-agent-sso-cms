import { CopyOutlined } from '@ant-design/icons';
import { BaseForm, NumericField, TextField } from '@components/cms';

import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';
import { copyToClipboard } from '@utils';
import { Button, Card, Col, Form, Input, Row, Space } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsModal from './SettingModal';
import { AppConstants } from '@constants';
dayjs.extend(customParseFormat);

const AppForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const [arraySetting, setArraySetting] = useState([]);
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const convertArrayToJson = (array) => {
        return array.reduce((acc, item) => {
            acc[item.key] = isNaN(item.value) || typeof item.value === 'boolean' ? item.value : Number(item.value);
            return acc;
        }, {});
    };

    const handleCopy = (record) => {
        const textCopy = {
            appId: record?.id,
            secretId: record?.secretId,
        };
        copyToClipboard(JSON.stringify(textCopy, null, 2));
    };
    const handleSubmit = (values) => {
        const settings = convertArrayToJson(arraySetting);
        const jsonString = JSON.stringify(settings);
        const finalValues = {
            ...values,
            settings: jsonString,
        };
        return mixinFuncs.handleSubmit(finalValues);
    };
    function renderJsonToArray(data) {
        return Object.keys(data).map((key) => ({
            key: key,
            value: data[key],
        }));
    }

    useEffect(() => {
        if (dataDetail?.settings) {
            const result = renderJsonToArray(JSON.parse(dataDetail?.settings));
            setArraySetting(result);
        }

        form.setFieldsValue({
            ...dataDetail,
        });
    }, [dataDetail]);

    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
            });
        }
        // setArraySetting([{ key: 'tenantId', value: 1 }]);
    }, [isEditing]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={12}>
                    <Col span={12}>
                        <TextField
                            required
                            label={
                                <FormattedMessage
                                    defaultMessage="Tên ứng dụng"
                                    description=""
                                    id="source.src.modules.manager.AccountApp.appName"
                                />
                            }
                            name="name"
                        />
                    </Col>
                    {dataDetail?.id != AppConstants.appId && (
                        <Col span={12}>
                            <TextField required label={<FormattedMessage defaultMessage="Url api" />} name="url" />
                        </Col>
                    )}
                    {isEditing && (
                        <Col span={12}>
                            <Form.Item label="secret Id" name="secretId">
                                <Space.Compact
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    <Input disabled={true} value={dataDetail?.secretId} />
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={() => handleCopy(dataDetail)}
                                        type="primary"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderColor: '#d9d9d9',
                                            color: '#000000',
                                        }}
                                    />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                    )}
                    {isEditing && (
                        <Col span={12}>
                            <NumericField width={"100%"} min={0} required label={<FormattedMessage defaultMessage="Phiên bản" />} fieldName="version" />
                        </Col>
                    )}
                </Row>
                <Row gutter={12}>
                    <Col span={24}>
                        <TextField
                            label={
                                <FormattedMessage
                                    defaultMessage="Mô tả"
                                    description=""
                                    id="source.src.modules.manager.AccountApp.descripstion"
                                />
                            }
                            type="textarea"
                            name="description"
                            required
                        />
                    </Col>
                </Row>
                <SettingsModal
                    arraySetting={arraySetting}
                    setArraySetting={setArraySetting}
                    setIsChangedFormValues={setIsChangedFormValues}
                />

                <div className="footer-card-form" style={{ marginTop: 15 }}>
                    {actions}
                </div>
            </Card>
        </BaseForm>
    );
};

export default AppForm;
