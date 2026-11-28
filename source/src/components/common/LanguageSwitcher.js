import { CheckOutlined, TranslationOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import React from 'react';

import useLocale from '@hooks/useLocale';

// Round icon button that opens the list of registered languages (used on the login page)
const LanguageSwitcher = ({ className }) => {
    const { locale, languages, changeLocale } = useLocale();

    return (
        <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
                selectedKeys: [locale],
                items: languages.map((language) => ({
                    key: language.code,
                    label: language.label,
                    icon: language.code === locale ? <CheckOutlined /> : <span style={{ width: 14 }} />,
                    onClick: () => changeLocale(language.code),
                })),
            }}
        >
            <Button
                className={className}
                shape="circle"
                aria-label="Language"
                icon={<TranslationOutlined />}
            />
        </Dropdown>
    );
};

export default LanguageSwitcher;
