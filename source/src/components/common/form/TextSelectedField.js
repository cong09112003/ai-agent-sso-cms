import { Form, Input, AutoComplete } from 'antd';
import React, { useEffect, useState } from 'react';
import useFormField from '@hooks/useFormField';
import TextArea from 'antd/es/input/TextArea';

const TextSelectedField = (props) => {
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
        options = [],
    } = props;

    const [inputValue, setInputValue] = useState(initialValue || '');
    const { rules: formRules, placeholder } = useFormField(props);

    const handleChange = (value) => {
        setInputValue(value);
        if (onChange) onChange(value);
    };

    const getTextFieldRules = () => {
        const { maxLength, minLength, type: fieldType, invalidEmailMsg } = props;
        const rules = [];
        if (maxLength) rules.push({ max: maxLength, message: `Số ký tự không thể nhiều hơn ${maxLength}` });
        if (minLength) rules.push({ min: minLength, message: `Số ký tự không thể ít hơn ${minLength}` });
        if (fieldType === 'email') rules.push({ type: 'email', message: invalidEmailMsg || 'Định dạng email không hợp lệ' });
        return rules;
    };

    useEffect(() => {
        setInputValue(initialValue || '');
    }, [initialValue]);

    return (
        <Form.Item
            className={className}
            label={label}
            name={name}
            validateStatus={validateStatus}
            initialValue={initialValue}
            help={help}
            rules={[...formRules, ...getTextFieldRules()]}
        >
            {type === 'textarea' ? (
                <TextArea
                    rows={4}
                    value={inputValue}
                    onChange={(e) => handleChange(e.target.value)}
                    style={style}
                    placeholder={placeholder}
                    disabled={disabled}
                    onBlur={onBlur}
                />
            ) : options.length > 0 ? (
                <AutoComplete
                    style={{ width: '100%', ...style }}
                    options={inputValue ? [] : options.map(opt => ({ value: opt.value, label: opt.label }))}
                    value={inputValue}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder={placeholder}
                >
                    <Input  
                        size={size}
                        onBlur={onBlur}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                </AutoComplete>
            ) : (
                <Input
                    value={inputValue}
                    onChange={(e) => handleChange(e.target.value)}
                    style={style}
                    size={size}
                    placeholder={placeholder}
                    disabled={disabled}
                    type={type}
                    onBlur={onBlur}
                    readOnly={readOnly}
                />
            )}
        </Form.Item>
    );
};

export default TextSelectedField;
