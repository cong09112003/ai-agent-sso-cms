import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

import useTheme from '@hooks/useTheme';

// Dark sider/menu use the same surface color as the header instead of antd's default navy
const darkComponents = {
    Layout: { siderBg: '#141414' },
    Menu: { darkItemBg: '#141414', darkSubMenuItemBg: '#0a0a0a', darkPopupBg: '#1f1f1f' },
};

// Applies the light/dark Ant Design algorithm and sets body[data-theme] for the SCSS variables in common.scss
const ThemeProvider = ({ children }) => {
    const { theme, isDark } = useTheme();

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <ConfigProvider
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
