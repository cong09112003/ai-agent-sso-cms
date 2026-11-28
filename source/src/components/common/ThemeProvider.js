import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

import dayjs from 'dayjs';

import { languages } from '@constants';
import useLocale from '@hooks/useLocale';
import useTheme from '@hooks/useTheme';

// Dark sider/menu use the same surface color as the header instead of antd's default navy
const darkComponents = {
    Layout: { siderBg: '#141414' },
    Menu: { darkItemBg: '#141414', darkSubMenuItemBg: '#0a0a0a', darkPopupBg: '#1f1f1f' },
};

// Applies the light/dark Ant Design algorithm and sets body[data-theme] for the SCSS variables in common.scss
const ThemeProvider = ({ children }) => {
    const { theme, isDark } = useTheme();
    const { locale } = useLocale();
    const language = languages.find((item) => item.code === locale) || languages[0];

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // antd component texts and dayjs (date pickers, formatting) follow the selected language
    dayjs.locale(language.dayjsLocale);
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return (
        <ConfigProvider
            locale={language.antdLocale}
            theme={{
                algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                components: isDark ? darkComponents : undefined,
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default ThemeProvider;
