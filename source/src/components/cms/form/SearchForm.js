import React from 'react';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Flex, Form, Row } from 'antd';
import { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import DatePickerField from './DatePickerField';
import DateRangePickerField from './DateRangePickerField';
import InputTextField from './InputTextField';
import SelectField from './SelectField';

import dayjs from 'dayjs';
import { DEFAULT_FORMAT, FieldTypes } from '../constants';
import AutoCompleteField from './AutoCompleteField';
import styles from './SearchForm.module.scss';
import useFilterStorage from '../hooks/useFilterStorage';

const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
};

const searchFields = {
    [FieldTypes.SELECT]: SelectField,
    [FieldTypes.DATE]: DatePickerField,
    [FieldTypes.DATE_RANGE]: (props) => <DateRangePickerField disabledDate={disabledDate} {...props} />,
    [FieldTypes.AUTOCOMPLETE]: AutoCompleteField,
    default: InputTextField,
};


const message = defineMessages({
    search: {
        id: 'lib.searchForm.search',
        defaultMessage: 'Tìm kiếm',
    },
    clear: {
        id: 'lib.searchForm.clear',
        defaultMessage: 'Xóa',
    },
});

function SearchForm({
    fields = [],
    hiddenAction,
    onSearch,
    className,
    onReset,
    initialValues,
    width,
    alignSearchField,
    getFormInstance,
    hidenClearAction = true,
    searchParams,
}) {
    const [form] = Form.useForm();
    const intl = useIntl();
    const { clearCurrentFilter } = useFilterStorage();
    const dateRangeKey = useRef({});

    const handleSearchSubmit = useCallback(
        (values) => {
            // const dateRangeValues = Object.keys(dateRangeKey.current).reduce((acc, key) => {
            //     if (!values[key]) return acc;

            //     acc[dateRangeKey.current[key][1]] = formatDateToUtc(values[key][0]) + ' 00:00:00';
            //     acc[dateRangeKey.current[key][2]] = formatDateToUtc(values[key][1]) + ' 23:59:59';

            //     delete values[key];

            //     console.log('acc', acc);

            //     return acc;
            // }, {});
            // onSearch?.({ ...values, ...dateRangeValues });
            onSearch?.(values);
        },
        [form, onSearch],
    );

    const handleClearSearch = () => {
        clearCurrentFilter();
        form.resetFields();
        onReset?.();
    };

    const renderField = useCallback(
        ({ type, submitOnChanged, onChange, key, renderItem, style, component, ...props }) => {
            if (renderItem) {
                return (
                    <Form.Item {...props} name={key} style={{ marginBottom: '0px' }}>
                        {renderItem()}
                    </Form.Item>
                );
            }

            const Field = component || searchFields[type] || searchFields.default;
            return (
                <Field
                    {...props}
                    name={key}
                    fieldProps={{
                        ...props.fieldProps,
                        style: { ...style, width: '100%', height: 32 },
                    }}
                    style={{ ...style, width: '100%', height: 32 }}
                    onChange={(e) => {
                        if (submitOnChanged) {
                            form.submit();
                        } else {
                            onChange?.(e);
                        }
                    }}
                />
            );
        },
        [handleSearchSubmit],
    );

    useEffect(() => {
        getFormInstance?.(form);
    }, [form]);

    useEffect(() => {
        const normalizeValues = { ...initialValues };
        const fieldMap = fields.reduce((acc, field) => {
            acc[field.key] = field;
            return acc;
        }, {});
        Object.keys(normalizeValues).forEach((key) => {
            const fieldInfo = fieldMap[key];
            const isNotAutocomplete = fieldInfo && fieldInfo.type !== FieldTypes.AUTOCOMPLETE;
            const value = normalizeValues[key];

            if (fieldInfo?.type === FieldTypes.DATE) {
                normalizeValues[key] = dayjs.isDayjs(value)
                    ? value.add(7, 'hour')
                    : dayjs(value, DEFAULT_FORMAT).add(7, 'hour');
                return;
            }

            if (
                fieldInfo?.type === FieldTypes.AUTOCOMPLETE &&
                fieldInfo?.fieldProps?.mode === 'multiple'
            ) {
                if (typeof value === 'string') {
                    normalizeValues[key] = value
                        .split(',')
                        .filter(Boolean);
                }
            }
            if (
                isNotAutocomplete &&
                !isNaN(normalizeValues[key]) &&
                normalizeValues[key] !== null
            ) {
                normalizeValues[key] = Number(normalizeValues[key]);
            }
            if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
                const parsed = dayjs(value, DEFAULT_FORMAT);
                if (parsed.isValid()) {
                    normalizeValues[key] = parsed;
                }
            }
        });
        form.setFieldsValue(normalizeValues);
    }, [initialValues]);

    return (
        <Form form={form} layout="horizontal" className={className || styles.searchForm} onFinish={handleSearchSubmit}>
            <Row align={alignSearchField} gutter={10} style={{ maxWidth: width }}>
                {searchParams ? (
                    <Flex justify="start">{searchParams}</Flex>
                ) : (
                    fields.map((field) => {
                        const { key, colSpan, className, ...props } = field;
                        return (
                            <Col key={key} span={colSpan || 4} className={className}>
                                {renderField({ ...props, key })}
                            </Col>
                        );
                    })
                )}

                {!hiddenAction && fields.length > 0 && (
                    <Col>
                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                            {intl.formatMessage(message.search)}
                        </Button>
                        {hidenClearAction && (
                            <Button style={{ marginLeft: 8 }} icon={<ClearOutlined />} onClick={handleClearSearch}>
                                {intl.formatMessage(message.clear)}
                            </Button>
                        )}
                    </Col>
                )}
            </Row>
        </Form>
    );
}

export default SearchForm;
