import React from 'react';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { Form, Switch } from 'antd';
import useFormField from '../hooks/useFormField';

function BooleanField({
    label,
    labelNode,
    labelAlign = 'space-between',
    name,
    disabled = false,
    onChange,
    formItemProps,
    fieldProps = {},
    style = {},
    ...props
}) {
    const { rules } = useFormField(props);

    return (
        <Form.Item {...formItemProps} colon={false} style={{ marginBottom: 16, ...formItemProps?.style }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: labelAlign,
                    alignItems: 'center',
                    width: '100%',
                    gap: 8,
                    opacity: disabled ? 0.5 : 1,
                    pointerEvents: disabled ? 'none' : 'auto',
                    ...style,
                }}
            >
                <div>{labelNode || label}</div>
                <Form.Item name={name} rules={rules} valuePropName="checked" noStyle>
                    <Switch
                        {...fieldProps}
                        onChange={onChange}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        disabled={disabled || fieldProps.disabled}
                    />
                </Form.Item>
            </div>
        </Form.Item>
    );
}

export default BooleanField;