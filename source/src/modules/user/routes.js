import apiConfig from '@constants/apiConfig';
import UserAdminListPage from '.';
import UserAdminSavePage from './UserAdminSavePage';
import UserListPage from './users';
import UserSavePage from './users/UserSavePage';
import { commonMessage } from '@locales/intl';
import AddressListPage from './address';
import AddressSavePage from './address/AddressSavePage';
import PostListPage from '.';
const paths = {
    postsListPage: '/posts',
    adminsSavePage: '/admins/:id',
    adminsLeaderListPage: '/admins-leader',
    adminsLeaderSavePage: '/admins-leader/:id',
    userListPage: '/user',
    userSavePage: '/user/:id',
    addressListPage:'/user/address',
    addressSavePage: '/user/address/:id',
};
export default {
    postsListPage: {
        path: paths.postsListPage,
        auth: true,
        component: PostListPage,
        pageOptions: {
            objectName: commonMessage.posts,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: 'Posts' }];
            },
        },
    },

    /// USERS

    userListPage: {
        path: paths.userListPage,
        auth: true,
        component: UserListPage,
        // permission: [apiConfig.user.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.user,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.user) }];
            },
        },
    },
    userSavePage: {
        path: paths.userSavePage,
        component: UserSavePage,
        separateCheck: true,
        auth: true,
        pageOptions: {
            objectName: commonMessage.user,
            listPageUrl: paths.userListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.user), path: paths.userListPage },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    addressListPage: {
        path: paths.addressListPage,
        auth: true,
        component: AddressListPage,
        pageOptions: {
            objectName: commonMessage.address,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.user), path: paths.userListPage },
                    { breadcrumbName: t.formatMessage(messages.address) },
                ];
            },
        },
    },
    addressSavePage: {
        path: paths.addressSavePage,
        component: AddressSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.address.create.baseURL, apiConfig.address.update.baseURL],
        pageOptions: {
            objectName: commonMessage.address,
            listPageUrl: paths.addressListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.user), path: paths.userListPage },
                    { breadcrumbName: t.formatMessage(commonMessage.address), path: paths.addressListPage+`?userId=${options.userId}` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
