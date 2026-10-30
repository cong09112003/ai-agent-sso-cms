import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import SettingsModal from '../../SettingModal';
import { AutoCompleteField, BaseForm, SelectField } from '@components/cms';
dayjs.extend(customParseFormat);

const AccountAppForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [arraySetting, setArraySetting] = useState([]);
    const location = useLocation();

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

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
    function renderJsonToArray(data) {
        return Object.keys(data).map((key) => ({
            key: key,
            value: data[key],
        }));
    }

    const handleSubmit = (values) => {
        const settings = convertArrayToJson(arraySetting);
        const jsonString = JSON.stringify(settings);
        const finalValues = {
            ...values,
            appId,
            userKindId,
            settings: jsonString,
        };

        return mixinFuncs.handleSubmit(finalValues);
    };

    useEffect(() => {
        if (dataDetail?.settings) {
            const result = renderJsonToArray(JSON.parse(dataDetail?.settings));
            setArraySetting(result);
        }
        form.setFieldsValue({
            ...dataDetail,
            accountId: dataDetail?.account?.id,
            roleId: dataDetail?.role?.id,
        });
    }, [dataDetail]);


    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        {!isEditing ? (
                            <AutoCompleteField
                                key="editing-account"
                                label={<FormattedMessage defaultMessage="Tài khoản" />}
                                name={['accountId']}
                                apiConfig={apiConfig.account.autocomplete}
                                mappingOptions={(item) => ({ value: item.id, label: item.fullName || item.username })}
                                searchParams={(text) => ({ 
                                    ignoreAppId: appId, 
                                    ignoreUserKindId: userKindId, 
                                    fullName: text, 
                                })}
                                initialSearchParams={{ 
                                    ignoreAppId: appId, 
                                    ignoreUserKindId: userKindId, 
                                }}
                                required
                                allowClear={false}
                                isEditing={true}
                                initField={{ 
                                    value: dataDetail?.account?.id, 
                                    label: dataDetail?.account?.fullName || dataDetail?.account?.username, 
                                }}
                                useFetch={useFetch}
                            />
                        ) : (
                            <AutoCompleteField
                                key="create-account"
                                label={<FormattedMessage defaultMessage="Tài khoản" />}
                                name={['accountId']}
                                apiConfig={apiConfig.account.autocomplete}
                                mappingOptions={(item) => ({ value: item.id, label: item.fullName || item.username })}
                                searchParams={(text) => ({ 
                                    fullName: text, 
                                })}
                                initialSearchParams={{}} 
                                required
                                allowClear={false}
                                isEditing={false}
                                useFetch={useFetch}
                            />
                        )}
                    </Col>
                    {/* <Col span={12}>
                        <SelectField
                            required
                            label={translate.formatMessage(commonMessage.userType)}
                            name={['userKindId']}
                            options={dataUserKind}
                            onChange={(value, item) => {
                                const updatedFormData = {
                                    key: 'kind',
                                    value: item.kind,
                                };
                                setCheckUserKind(item.kind);
                                executeGetRoles({
                                    params: {
                                        appId,
                                        userKindId: item?.value,
                                    },
                                    onCompleted: () => {
                                        form.setFieldValue('roleId', null);
                                    },
                                });
                            }}
                            allowClear={false}
                        />
                    </Col> */}
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Quyền hạn" />}
                            name={['roleId']}
                            options={dataRoles}
                            allowClear={false}
                        // disabled={checkUserKind == null}
                        />
                    </Col>
                </Row>
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
