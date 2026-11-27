import apiConfig from '@constants/apiConfig';
import CompanyListPage from '.';
import CompanySavePage from './CompanySavePage';

export default {
    companyListPage: {
        path: '/company',
        title: 'company',
        auth: true,
        component: CompanyListPage,
        permission: [apiConfig.company.getList.permissionCode],
    },
    companySavePage: {
        path: '/company/:id',
        title: 'company savebase',
        auth: true,
        component: CompanySavePage,
        permission: [apiConfig.company.getById.permissionCode, apiConfig.company.create.permissionCode, apiConfig.company.update.permissionCode],
    },
};
