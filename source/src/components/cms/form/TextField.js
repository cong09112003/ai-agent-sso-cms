import React from 'react';
import { Form, Input } from 'antd';
import { defineMessages, useIntl } from 'react-intl';
import useFormField from '../hooks/useFormField';

const { TextArea } = Input;

const messages = defineMessages({
    maxLength: 'Số ký tự không thể nhiều hơn {max}',
    minLength: 'Số ký tự không thể ít hơn {min}',
});

const TextField = (props) => {
    const {
        type,
        size,
        label,
        name,
        disabled,
        onBlur,
        validateStatus,
        help,
        style,
        className,
        onChange,
        readOnly,
        initialValue,
        defaultValue,
        prefix,
        suffix,
        addonAfter,
        autoSize,
        rows,
        formItemProps,
        fieldProps,
        autoComplete,
    } = props;

    const intl = useIntl();

    const getMaxLengthMsg = () => {
        const { maxLength, maxLengthMsg } = props;
        return maxLengthMsg || intl.formatMessage(messages.maxLength, { max: maxLength });
    };

    const getMinLengthMsg = () => {
        const { minLength, minLengthMsg } = props;
        return minLengthMsg || intl.formatMessage(messages.minLength, { min: minLength });
    };

    const getTextFieldRules = () => {
        const { maxLength, minLength } = props;
        const rules = [];
        if (maxLength) {
            rules.push({ max: maxLength, message: getMaxLengthMsg() });
        }
        if (minLength) {
            rules.push({ min: minLength, message: getMinLengthMsg() });
        }
        return rules;
    };

    const { rules, placeholder } = useFormField(props);

    return (
        <Form.Item
            {...formItemProps}
            className={className}
            label={label}
            name={name}
            validateStatus={validateStatus}
            initialValue={initialValue}
            help={help}
            rules={[...rules, ...getTextFieldRules()]}
        >
            {type === 'password' ? (
                <Input.Password
                    onChange={onChange}
                    style={style}
                    size={size}
                    placeholder={placeholder}
                    disabled={disabled}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    defaultValue={defaultValue}
                    prefix={prefix}
                    addonAfter={addonAfter}
                    autoComplete={autoComplete}
                    visibilityToggle
                    {...fieldProps}
                />
            ) : type === 'textarea' ? (
                <TextArea
                    rows={rows || 4}
                    onChange={onChange}
                    style={style}
                    placeholder={placeholder}
                    disabled={disabled}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    autoSize={autoSize}
                    {...fieldProps}
                />
            ) : (
                <Input
                    onChange={onChange}
                    style={style}
                    size={size}
                    placeholder={placeholder}
                    disabled={disabled}
                    type={type}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    defaultValue={defaultValue}
                    prefix={prefix}
                    suffix={suffix}
                    addonAfter={addonAfter}
                    autoComplete={autoComplete}
                    {...fieldProps}
                />
            )}
        </Form.Item>
    );
};

export default TextField;