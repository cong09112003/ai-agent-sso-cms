import { DEFAULT_FORMAT } from '@constants';
import apiConfig from '@constants/apiConfig';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useSsoFileUrl from '@hooks/useSsoFileUrl';
import useTranslate from '@hooks/useTranslate';
import {
    BaseForm,
    CropImageField,
    DatePickerField,
    NumericField,
    SelectField,
    TextField,
} from '@components/cms';
import { showErrorMessage } from '@services/notifyService';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

dayjs.extend(customParseFormat);

const messages = defineMessages({
    uploadFailed: 'Tải ảnh lên thất bại',
});

const ProjectForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const { execute: executeUpFile } = useFetch(apiConfig.file.ssoUpload);
    const [avatarPath, setAvatarPath] = useState(null);
    const avatarSrc = useSsoFileUrl(avatarPath);

    const { data: companyOptions } = useFetch(apiConfig.company.autocomplete, {
        immediate: true,
        params: { page: 0, size: 1000 },
        mappingData: ({ data }) => data.content.map((item) => ({ value: item.id, label: item.name })),
    });

    // make sure the current company is selectable even if it is not in the first page of the autocomplete
    const currentCompany = dataDetail?.company;
    const allCompanyOptions =
        currentCompany && !companyOptions?.some((item) => item.value === currentCompany.id)
            ? [{ value: currentCompany.id, label: currentCompany.name }, ...(companyOptions || [])]
            : companyOptions || [];

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
                onSuccess();
                setAvatarPath(response.data?.filePath);
                setImageUrl(response.data?.filePath);
                setIsChangedFormValues(true);
            },
            onError: () => {
                onError();
                showErrorMessage(translate.formatMessage(messages.uploadFailed));
            },
        });
    };

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({
            ...values,
            avatarPath: avatarPath,
            startAt: values.startAt ? dayjs(values.startAt).format(DEFAULT_FORMAT) : null,
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
            companyId: dataDetail?.company?.id,
            startAt: dataDetail?.startAt ? dayjs(dataDetail.startAt, DEFAULT_FORMAT) : null,
        });
        setAvatarPath(dataDetail?.avatarPath);
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <CropImageField
                            label={<FormattedMessage defaultMessage="Ảnh đại diện" />}
                            name="avatarPath"
                            imageUrl={avatarSrc}
                            accept="image/*"
                            aspect={1 / 1}
                            uploadFile={(...args) => uploadFile(...args, setAvatarPath)}
                        />
                    </Col>
                </Row>
                <Row gutter={10}>
                    <Col span={12}>
                        <SelectField
                            required
                            label={<FormattedMessage defaultMessage="Doanh nghiệp" />}
                            name="companyId"
                            options={allCompanyOptions}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            name="code"
                            label={<FormattedMessage defaultMessage="Mã dự án" />}
                            required
                            fieldProps={{ maxLength: 50 }}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            name="name"
                            label={<FormattedMessage defaultMessage="Tên dự án" />}
                            required
                            fieldProps={{ maxLength: 255 }}
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            name="currentPhase"
                            label={<FormattedMessage defaultMessage="Giai đoạn hiện tại" />}
                            fieldProps={{ maxLength: 255 }}
                        />
                    </Col>
                    <Col span={12}>
                        <NumericField
                            name="numberOfMembers"
                            label={<FormattedMessage defaultMessage="Số lượng thành viên" />}
                            min={0}
                            precision={0}
                            formatter={(value) => value}
                            parser={(value) => value}
                        />
                    </Col>
                    <Col span={12}>
                        <DatePickerField
                            name="startAt"
                            label={<FormattedMessage defaultMessage="Ngày bắt đầu" />}
                            showTime
                            format={DEFAULT_FORMAT}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            name="description"
                            type="textarea"
                            label={<FormattedMessage defaultMessage="Mô tả" />}
                        />
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

export default ProjectForm;
