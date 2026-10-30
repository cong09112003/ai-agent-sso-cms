import React from 'react';

import { Form, Input } from 'antd';
import useFormField from '../hooks/useFormField';

const InputTextField = ({
    label = '',
    name = '',
    formItemProps,
    fieldProps,
    size,
    type,
    ...props
}) => {
    const {
        rules,
        placeholder,
    } = useFormField(props);

    return (
        <Form.Item
            label={label}
            name={name}
            validateFirst
            rules={rules}
            {...formItemProps}
        >
            <Input
                {...fieldProps}
                placeholder={placeholder}
                size={size}
                type={type}
            />
        </Form.Item>
    );
};

export default InputTextField;
