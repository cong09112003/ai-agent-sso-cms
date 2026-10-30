import { BaseForm, TextField } from '@components/cms';
import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
dayjs.extend(customParseFormat);

const AppExtraForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');

    const handleSubmit = (values) => {
        return mixinFuncs.handleSubmit({ ...values });
    };

    useEffect(() => {
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
    }, [isEditing]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={12}>
                        <TextField
                            label="Tên"
                            placeholder="Tên"
                            name="name"
                            required
                        />
                    </Col>
                    <Col span={12}>
                        <TextField
                            label="Đường dẫn"
                            placeholder="Đường dẫn"
                            name="linkUrl"
                            required
                        />
                    </Col>
                    <Col span={24}>
                        <TextField
                            label="Mô tả"
                            name="description"
                            type="textarea"
                            style={{ height: 600 }}
                        />
                    </Col>
                </Row>

                <div className="footer-card-form" style={{ marginTop: 15 }}>{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default AppExtraForm;
