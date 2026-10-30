import { AppstoreOutlined, ControlOutlined, UserOutlined } from '@ant-design/icons';
import routes from '@routes';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import apiConfig from './apiConfig';

export const navMenuConfig = [
    {
        label: <FormattedMessage defaultMessage="Quản lý tài khoản" />,
        key: 'quan-ly-tai-khoan',
        icon: <UserOutlined size={16} />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Quản lí tài khoản" />,
                key: 'manager',
                path: routes.managerListPage.path,
                permission: [apiConfig.user.getList.permissionCode],
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Quản lí ứng dụng" />,
        key: 'quan-ly-du-an',
        icon: <AppstoreOutlined size={16} />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Quản lí ứng dụng" />,
                key: 'project',
                path: routes.AppListPage.path,
                permission: [apiConfig.app.getList.permissionCode],
            },
        ],
    },

    // {
    //     label: <FormattedMessage defaultMessage="Hệ thống" />,
    //     key: 'system-management',
    //     icon: <ControlOutlined />,
    //     children: [
    //         {
    //             label: <FormattedMessage defaultMessage="Quyền hạn" />,
    //             key: 'role',
    //             path: routes.groupPermissionPage.path,
    //             permission: [apiConfig.groupPermission.getGroupList.permissionCode],
    //         },
    //     ],
    // },
    // {
    //     label: <FormattedMessage defaultMessage="Quản lí khách hàng" />,
    //     key: 'quan-ly-khach-hang',
    //     icon: <UsergroupAddOutlined size={16} />,
    //     children: [

    //     ],
    // },
    // {
    //     label: <FormattedMessage defaultMessage="Quản lý đơn hàng" />,
    //     key: 'quan-ly-don-hang',
    //     icon: <IconTruckDelivery size={16} />,
    //     children: [
    //         {
    //             label: <FormattedMessage defaultMessage="Đơn hàng" />,
    //             key: 'order',
    //             path: routes.orderListPage.path,

    //         },
    //     ],
    // },
];