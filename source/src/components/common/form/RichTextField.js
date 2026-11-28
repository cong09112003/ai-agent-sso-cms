import { Form } from 'antd';
import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import useFormField from '@components/cms/hooks/useFormField';
import styles from './RichTextField.module.scss';

const EMPTY_HTML = '<p><br></p>';

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
    ],
};
const formats = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'];

// Controlled input for antd Form.Item: value is an HTML string, an empty editor is reported as ''
const QuillInput = ({ value, onChange, placeholder, readOnly, disabled }) => (
    <ReactQuill
        theme="snow"
        value={value || ''}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly || disabled}
        onChange={(content, delta, source) => {
            // programmatic updates (form.setFieldsValue) must not mark the form as changed
            if (source !== 'user') return;
            onChange?.(content === EMPTY_HTML ? '' : content);
        }}
    />
);

// Rich text ("form nhap van ban") field integrated with antd Form like the other *Field components.
// The stored value is HTML; never render it with dangerouslySetInnerHTML outside this editor.
const RichTextField = (props) => {
    const { label, name, className, formItemProps, initialValue, placeholder, readOnly, disabled } = props;
    const { rules } = useFormField(props);

    return (
        <Form.Item
            {...formItemProps}
            className={[styles.richText, className].filter(Boolean).join(' ')}
            label={label}
            name={name}
            initialValue={initialValue}
            rules={rules}
        >
            <QuillInput placeholder={placeholder} readOnly={readOnly} disabled={disabled} />
        </Form.Item>
    );
};

export default RichTextField;
