import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { AutoCompleteField, BaseForm, SelectField } from '@components/cms';
import { commonMessage } from '@locales/intl';
import SettingsModal from '@modules/app/SettingModal';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
dayjs.extend(customParseFormat);

const AccountAppForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [appId, setAppId] = useState(0);
    const location = useLocation();
    const [roleOptions, setRoleOPtions] = useState([]);
    const [arraySetting, setArraySetting] = useState([]);

    const params = new URLSearchParams(location.search);
    const accountId = params.get('accountId');

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const { execute: executeGetRole } = useFetch(apiConfig.role.autocomplete, {
        immediate: false,
    });

    const CheckJson = (rule, value) => {
        if (!value) {
            return Promise.resolve();
        }

        try {
            JSON.parse(value);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(new Error('Dữ liệu không đúng định dạng JSON!'));
        }
    };

    const handleSubmit = (values) => {
        const settings = convertArrayToJson(arraySetting);
        const jsonString = JSON.stringify(settings);
        const finalValues = {
            ...values,
            accountId: accountId,
            isSuperAdmin: true,
            settings: jsonString,
        };
        return mixinFuncs.handleSubmit(finalValues);
    };

    const convertArrayToJson = (array) => {
        return array.reduce((acc, item) => {
            acc[item.key] = isNaN(item.value) || typeof item.value === 'boolean' ? item.value : Number(item.value);
            return acc;
        }, {});
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
        if (dataDetail?.app?.id) handleAppIdChange(dataDetail?.app?.id);
        form.setFieldsValue({
            ...dataDetail,
            appId: dataDetail?.app?.id,
            roleId: dataDetail?.role?.id,
            settings: dataDetail?.settings,
        });
    }, [dataDetail]);

    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[1].value,
                
            });
            // setArraySetting([{ key: 'isSuperAdmin', value: 'false',  deletable: false }]);
        }
    }, [isEditing]);

    const handleAppIdChange = async (value) => {
        setAppId(value);
        form.setFieldsValue({ roleId: null });
        setRoleOPtions([]);
        try {
            await executeGetRole({
                method: 'GET',
                params: { appId: value },
                onCompleted: (response) => {
                    const formattedOptions = response.data.content.map((role) => ({
                        value: role.id,
                        label: role.name,
                    }));
                    setRoleOPtions(formattedOptions);
                },
                onError: (error) => {
                    console.error('Error creating task:', error);
                },
            });
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <AutoCompleteField
                            label={
                                <FormattedMessage
                                    defaultMessage="App"
                                    description=""
                                    id="source.src.modules.manager.AccountApp.app"
                                />
                            }
                            name={['appId']}
                            required
                            apiConfig={apiConfig.app.autocomplete}
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            searchParams={(text) => ({ name: text })}
                            onChange={handleAppIdChange}
                            useFetch={useFetch}
                        />
                    </Col>
                    <Col span={12}>
                        <SelectField
                            label={translate.formatMessage(commonMessage.role)}
                            name={['roleId']}
                            required
                            mappingOptions={(item) => ({ value: item.id, label: item.name })}
                            searchParams={(text) => ({ name: text })}
                            options={roleOptions}
                            disabled={!appId}
                        />
                    </Col>
                </Row>
                {/* <Row gutter={10}>
                    <Col span={24}>
                        <TextField
                            label="settings"
                            type="textarea"
                            placeholder="Nhập dữ liệu Json"
                            name="settings"
                            rules={[
                                {
                                    validator: CheckJson,
                                },
                            ]}
                        />
                    </Col>
                </Row> */}
                <SettingsModal
                    arraySetting={arraySetting}
                    setArraySetting={setArraySetting}   
                    setIsChangedFormValues={setIsChangedFormValues}
                />

                <div className="footer-card-form" style={{ marginTop: 15 }}>{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default AccountAppForm;
