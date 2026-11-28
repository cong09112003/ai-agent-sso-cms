import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useSsoFileUrl from '@hooks/useSsoFileUrl';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, CropImageField, SelectField, TextField } from '@components/cms';
import RichTextField from '@components/common/form/RichTextField';
import { showApiError } from '@utils/apiError';
import { Card, Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

const messages = defineMessages({
    uploadFailed: 'Tải ảnh lên thất bại',
    invalidUrl: 'Đường dẫn không hợp lệ, vui lòng nhập lại',
});

const checkUrl = (_, value) => {
    if (value) {
        try {
            const url = new URL(value);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return Promise.reject(new Error(messages.invalidUrl.defaultMessage));
            }
        } catch (e) {
            return Promise.reject(new Error(messages.invalidUrl.defaultMessage));
        }
    }
    return Promise.resolve();
};

const CompanyForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const translate = useTranslate();
    const intl = useIntl();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { execute: executeUpFile } = useFetch(apiConfig.file.ssoUpload);
    const [avatarPath, setAvatarPath] = useState(null);
    const avatarSrc = useSsoFileUrl(avatarPath);
    const [bannerPath, setBannerPath] = useState(null);
    const bannerSrc = useSsoFileUrl(bannerPath);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const uploadFile = (file, onSuccess, onError, setImageUrl, setPath = setAvatarPath) => {
        executeUpFile({
            data: {
                type: 'AVATAR',
                file: file,
            },
            onCompleted: (response) => {
                onSuccess();
                setPath(response.data?.filePath);
                setImageUrl(response.data?.filePath);
                setIsChangedFormValues(true);
            },
            onError: (error) => {
                onError();
                showApiError(error, intl, translate.formatMessage(messages.uploadFailed));
            },
        });
    };

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({
            ...values,
            avatarPath: avatarPath,
            bannerPath: bannerPath,
        });
    };

    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
            });
        }
    }, [isEditing]);

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
        });
        setAvatarPath(dataDetail?.avatarPath);
        setBannerPath(dataDetail?.bannerPath);
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Logo" />}
                            name="avatarPath"
                            imageUrl={avatarSrc}
                            accept="image/*"
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setAvatarPath)}
                        />
                    </Col>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Banner" />}
                            name="bannerPath"
                            imageUrl={bannerSrc}
                            accept="image/*"
                            aspect={16 / 9}
                            uploadFile={(file, onSuccess, onError) =>
                                uploadFile(file, onSuccess, onError, () => {}, setBannerPath)
                            }
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            name="name"
                            label={<FormattedMessage defaultMessage="Tên doanh nghiệp" />}
                            required
                            fieldProps={{ maxLength: 255 }}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            name="nation"
                            label={<FormattedMessage defaultMessage="Quốc gia" />}
                            fieldProps={{ maxLength: 100 }}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            name="performanceUrl"
                            label={<FormattedMessage defaultMessage="Đường dẫn hiệu quả hoạt động" />}
                            rules={[{ validator: checkUrl }]}
                            fieldProps={{ maxLength: 1000 }}
                        />
                    </Col>
                    <Col span={24}>
                        <RichTextField name="description" label={<FormattedMessage defaultMessage="Mô tả" />} />
                    </Col>
                    {isEditing && (
                        <Col span={12}>
                            <SelectField
                                required
                                label={<FormattedMessage defaultMessage="Tình trạng" />}
                                name="status"
                                options={statusValues}
                            />
                        </Col>
                    )}
                </Row>

                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default CompanyForm;
