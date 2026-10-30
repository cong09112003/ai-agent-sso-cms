import {
    DownOutlined,
    LoginOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MoonOutlined,
    SunOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Layout, Menu, Space, theme as antdTheme } from 'antd';
import React from 'react';
const { Header } = Layout;

import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useLocale from '@hooks/useLocale';
import useTheme from '@hooks/useTheme';
import useTranslate from '@hooks/useTranslate';
import { removeCacheToken } from '@services/userService';
import { accountActions, appActions } from '@store/actions';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AppHeader.module.scss';

const message = defineMessages({
    profile: 'Profile',
    logout: 'Logout',
    locale: '{locale, select, en {Vietnamese} other {English}}',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
});

const AppHeader = ({ collapsed, onCollapse }) => {
    const { locale } = useLocale();
    const { profile } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { execute: executeLogout } = useFetch(apiConfig.account.logout);
    const translate = useTranslate();
    const { isDark, toggleTheme } = useTheme();
    const { token } = antdTheme.useToken();

    const handleChangeLocale = () => {
        dispatch(appActions.changeLanguage(locale === 'en' ? 'vi' : 'en'));
    };

    const onLogout = () => {
        removeCacheToken();
        dispatch(accountActions.logout());
    };

    return (
        <Header className={styles.appHeader} style={{ padding: 0, background: token.colorBgContainer }}>
            <span className={styles.iconCollapse} onClick={onCollapse}>
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Menu
                mode="horizontal"
                className={styles.rightMenu}
                selectedKeys={[]}
                items={[
                    {
                        key: 'menu',
                        label: (
                            <Space>
                                <Avatar
                                    icon={<UserOutlined />}
                                    src={profile?.account.avatarPath && `${AppConstants.contentRootUrl}${profile?.account.avatarPath}`}
                                />
                                {profile?.account?.fullName}
                                <DownOutlined />
                            </Space>
                        ),
                        children: [
                            {
                                label: translate.formatMessage(message.profile),
                                icon: <UserOutlined />,
                                key: 'profile',
                                onClick: () => navigate('/profile'),
                            },
                            {
                                label: translate.formatMessage(isDark ? message.lightMode : message.darkMode),
                                icon: isDark ? <SunOutlined /> : <MoonOutlined />,
                                key: 'theme',
                                onClick: toggleTheme,
                            },
                            // {
                            //     label: translate.formatMessage(message.locale, { locale }),
                            //     key: 'locale',
                            //     icon: <TranslationOutlined />,
                            //     onClick: handleChangeLocale,
                            // },
                            {
                                label: translate.formatMessage(message.logout),
                                icon: <LoginOutlined />,
                                key: 'logout',
                                onClick: onLogout,
                            },
                        ],
                    },
                ]}
            />
        </Header>
    );
};

export default AppHeader;
