import { statusOptions } from '@constants/masterData';
import useBasicForm from '@hooks/useBasicForm';
import useTranslate from '@hooks/useTranslate';
import { BaseForm, TextField } from '@components/cms';
import { Card, Col, Row } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
dayjs.extend(customParseFormat);

const UserTypeForm = ({ formId, actions, dataDetail, onSubmit, setIsChangedFormValues, categories, isEditing }) => {
    const translate = useTranslate();
    const statusValues = translate.formatKeys(statusOptions, ['label']);
    const [arraySetting, setArraySetting] = useState([]);

    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
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

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');


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
            appId: appId,
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
            kind: dataDetail?.kind && String(dataDetail.kind),
        });
    }, [dataDetail]);

    useEffect(() => {
        if (!isEditing) {
            form.setFieldsValue({
                status: statusValues[0].value,
                
            });
            // setArraySetting([{ key: 'isSuperAdmin', value: 'false',  deletable: false }]);
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
                            label="Loại"
                            placeholder="Loại"
                            name="kind"
                            type='number'
                            required
                        />
                    </Col>
                    {/* <Col span={12}>
                        <TextField
                            label="App"
                            placeholder="App"
                            name="app"
                            required
                        />
                    </Col> */}
                </Row>

                <div className="footer-card-form" style={{ marginTop: 15 }}>{actions}</div>
            </Card>
        </BaseForm>
    );
};

export default UserTypeForm;
