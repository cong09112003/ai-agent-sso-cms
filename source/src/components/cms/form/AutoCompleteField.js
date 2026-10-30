import { Form, Spin } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SelectField from './SelectField';
import useFormField from '../hooks/useFormField';
const { useFormInstance } = Form;
function AutoCompleteField({
    label,
    name,
    placeholder,
    rules,
    required,
    formItemProps,
    allowClear,
    fieldProps,
    apiConfig,
    mappingOptions,
    initialSearchParams,
    searchParams,
    optionsParams = {},
    maxOptions = 10,
    debounceTime = 600,
    onChange,
    disabled,
    renderCustomOption,
    useFetch,
}) {
    const { placeholder: _placeholder, rules: _rules } = useFormField({
        placeholder,
        rules,
        required,
    });
    const [fetching, setFetching] = useState(false);
    const [_options, setOptions] = useState();
    const { execute } = useFetch(apiConfig);
    const form = useFormInstance();
    const [initialOpts, setInitialOpts] = useState();
    const handleFetchOptions = useCallback(
        ({ searchText, onCompleted, onError }) => {
            execute({
                params: {
                    size: maxOptions,
                    page: 0,
                    ...optionsParams,
                    ...(searchParams ? searchParams(searchText) : {}),
                },
                onCompleted: (res) => {
                    onCompleted(res.data?.content?.map(mappingOptions));
                },
                onError,
            });
        },
        [maxOptions, searchParams, mappingOptions, optionsParams],
    );

    const handleOnSearch = useMemo(() => {
        const onCompleted = (options) => {
            setFetching(false);
            if (options) {
                setOptions(options);
            }
        };

        const onError = () => {
            setFetching(false);
        };

        const loadOptions = (searchText) => {
            if (searchText == '') {
                setOptions(initialOpts);
            }
            if (!searchText || !mappingOptions) return;
            setOptions([]);
            setFetching(true);
            handleFetchOptions({ searchText, onCompleted, onError });
        };

        return debounce(loadOptions, debounceTime);
    }, [handleFetchOptions, mappingOptions, debounceTime]);

    const getInitialOptions = useCallback(() => {
        execute({
            params: {
                page: 0,
                size: maxOptions,
                ...initialSearchParams,
                id: form?.getFieldValue(name),
            },
            onCompleted: (res) => {
                setOptions(res.data?.content?.map(mappingOptions) || []);
                setInitialOpts(res.data?.content?.map(mappingOptions) || []);
            },
        });
    }, [form?.getFieldValue(name)]);

    const handleFocus = useCallback(() => {
        if (_options?.length === 0) {
            setOptions(initialOpts);
        }
    }, [_options]);

    useEffect(() => {
        getInitialOptions();
    }, []);

    return (
        <SelectField
            fieldProps={fieldProps}
            formItemProps={formItemProps}
            label={label}
            name={name}
            rules={_rules}
            disabled={disabled}
            showSearch
            allowClear={allowClear}
            options={_options?.slice(0, maxOptions).map((opt) => {
                return {
                    ...opt,
                    value: opt.value,
                    label: opt.label,
                    item: opt.item,
                };
            })}
            filterOption={false}
            notFoundContent={fetching ? <Spin size="small" /> : undefined}
            onSearch={handleOnSearch}
            placeholder={_placeholder}
            renderCustomOption={renderCustomOption}
            onChange={(value, option) => {
                if (Array.isArray(value) && value.length === 0) {
                    form.setFieldValue(name, undefined);
                }
                onChange?.(value, option);
            }}
            onFocus={handleFocus}
            onClear={() => handleOnSearch('')}
        />
    );
}

export default AutoCompleteField;
