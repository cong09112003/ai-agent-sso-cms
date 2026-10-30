import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import { BaseForm, BooleanField, CropImageField, TextField } from '@components/cms';
import { Card, Col, Form, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ConfigsModal from './ConfigsModal';
dayjs.extend(customParseFormat);

const MobileConfigForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const [apiUrls, setApiUrls] = useState([]);
    const [iconUrl, setIconUrl] = useState(null);
    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const uploadFile = (file, onSuccess, onError, setImageUrl) => {
        executeUpFile({
            data: {
                type: 'LOGO',
                file: file,
            },
            onCompleted: (response) => {
                if (response.result === true) {
                    onSuccess();
                    setIconUrl(response.data.filePath);
                    setImageUrl(response.data.filePath);
                    setIsChangedFormValues(true);
                }
            },
            onError: (error) => {
                onError();
            },
        });
    };
    const isMobileEnabled = Form.useWatch('enableMobile', form);
    const handleSubmit = (values) => {
        const currentMobileConfig = dataDetail?.mobileConfig ? JSON.parse(dataDetail.mobileConfig) : {};
        
        const mobileConfigObj = {
            ...currentMobileConfig,
            name: values.name,
            mobileIcon: iconUrl || currentMobileConfig.mobileIcon,
            apiUrls: apiUrls,
        };

        const finalValues = {
            ...values,
            mobileConfig: JSON.stringify(mobileConfigObj),
        };
        delete finalValues.settings; 

        return mixinFuncs.handleSubmit(finalValues);
    };

    useEffect(() => {
        if (dataDetail?.mobileConfig) {
            try {
                const parsedConfig = JSON.parse(dataDetail.mobileConfig);
            
                setApiUrls(parsedConfig.apiUrls || []);
                setIconUrl(parsedConfig.mobileIcon);

                form.setFieldsValue({
                    ...dataDetail,
                    name: parsedConfig.name, 
                    enableMobile: dataDetail?.enableMobile ?? false,
                });
            } catch (error) {
                console.error("Lỗi parse mobileConfig JSON:", error);
            }
        } else {
            form.setFieldsValue({
                ...dataDetail,
                enableMobile: dataDetail?.enableMobile ?? false,
            });
        }
    }, [dataDetail, form]);
    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={12} style={{ marginBottom: 32 }}>
                    <Col span={24}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <BooleanField
                                required
                                name="enableMobile"
                                label={null}
                                formItemProps={{
                                    style: { marginBottom: 0 },
                                }}
                                style={{
                                    width: 'auto',
                                }}
                            />
                            <span style={{ marginLeft: 12 }}>
                                {/* <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span> */}
                                Kích hoạt mobile
                            </span>
                        </div>
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Icon" />}
                            name="avatarPath"
                            imageUrl={iconUrl && `${AppConstants.contentRootUrl}${iconUrl}`}
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setIconUrl)}
                            required
                            disabled={!isMobileEnabled}
                        />
                    </Col>
                </Row>
                <Row gutter={12} align="middle">
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
                            disabled={!isMobileEnabled}
                        />
                    </Col>
                </Row>
                <ConfigsModal
                    apiUrls={apiUrls}
                    setApiUrls={setApiUrls}
                    setIsChangedFormValues={setIsChangedFormValues}
                    disabled={!isMobileEnabled}
                />

                <div className="footer-card-form" style={{ marginTop: 15 }}>
                    {actions}
                </div>
            </Card>
        </BaseForm>
    );
};

export default MobileConfigForm;
