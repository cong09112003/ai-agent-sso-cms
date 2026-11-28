import {
    DownOutlined,
    CheckOutlined,
    LoginOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MoonOutlined,
    SunOutlined,
    TranslationOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Layout, Menu, Space, theme as antdTheme } from 'antd';
import React from 'react';
const { Header } = Layout;

import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useLocale from '@hooks/useLocale';
import useSsoFileUrl from '@hooks/useSsoFileUrl';
import useTheme from '@hooks/useTheme';
import useTranslate from '@hooks/useTranslate';
import { removeCacheToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './AppHeader.module.scss';

const message = defineMessages({
    profile: 'Profile',
    logout: 'Logout',
    language: 'Ngôn ngữ',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
});

const AppHeader = ({ collapsed, onCollapse }) => {
    const { locale, languages, changeLocale } = useLocale();
    const { profile } = useAuth();
    const avatarSrc = useSsoFileUrl(profile?.account?.avatarPath);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { execute: executeLogout } = useFetch(apiConfig.account.logout);
    const translate = useTranslate();
    const { isDark, toggleTheme } = useTheme();
    const { token } = antdTheme.useToken();

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
                                    src={avatarSrc}
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
                            {
                                label: translate.formatMessage(message.language),
                                key: 'language',
                                icon: <TranslationOutlined />,
                                children: languages.map((language) => ({
                                    key: `language-${language.code}`,
                                    label: language.label,
                                    icon: language.code === locale ? <CheckOutlined /> : <span style={{ width: 14 }} />,
                                    onClick: () => changeLocale(language.code),
                                })),
                            },
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
