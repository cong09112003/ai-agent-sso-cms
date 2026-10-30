import { Form, InputNumber } from 'antd';
import React from 'react';
import { formatNumber } from '../utils';
import useFormField from '../hooks/useFormField';

const NumericField = (props) => {
    const {
        label,
        name,
        disabled,
        min,
        max,
        width,
        onChange,
        onBlur,
        formatter,
        parser,
        className,
        defaultValue,
        ...restProps
    } = props;

    const fieldParser = (value) => {
        return value.replace(/\$\s?|(,*)/g, '');
    };

    const fieldFormatter = (value) => {
        return formatNumber(value);
    };

    const { rules, placeholder } = useFormField(props);

    return (
        <Form.Item label={label} name={name} rules={rules} className={className}>
            <InputNumber
                placeholder={placeholder}
                max={max}
                min={min}
                disabled={disabled}
                style={{ width: width || '100%' }}
                formatter={formatter || fieldParser}
                parser={parser || fieldFormatter}
                onChange={onChange}
                onBlur={onBlur}
                defaultValue={defaultValue}
                {...restProps}
            />
        </Form.Item>
    );
};

export default NumericField;
