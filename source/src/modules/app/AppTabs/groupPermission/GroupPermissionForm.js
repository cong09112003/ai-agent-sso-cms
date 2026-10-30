import { BaseForm, TextField } from '@components/cms';
import useBasicForm from '@hooks/useBasicForm';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
dayjs.extend(customParseFormat);

const GroupPermissionForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');

    const handleSubmit = (values) => {
        const finalValues = {
            ...values,
            appId: appId,
        };
        return mixinFuncs.handleSubmit(finalValues);
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
        });
    }, [dataDetail]);

    return (
        <BaseForm id={formId} onFinish={handleSubmit} form={form} onValuesChange={onValuesChange}>
            <Card className="card-form" bordered={false}>
                <Row gutter={10}>
                    <Col span={24}>
                        <TextField required label={<FormattedMessage defaultMessage="Tên nhóm quyền" description="" id="source.src.modules.app.AppTabs.GroupPermissionListPage.groupName"/>} name="name" />
                    </Col>
                </Row>
                <div className="footer-card-form">{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default GroupPermissionForm;
