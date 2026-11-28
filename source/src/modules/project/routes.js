import apiConfig from '@constants/apiConfig';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';

export default {
    projectListPage: {
        path: '/project',
        title: 'project',
        auth: true,
        component: ProjectListPage,
        permission: [apiConfig.project.getList.permissionCode],
    },
    projectSavePage: {
        path: '/project/:id',
        title: 'project savebase',
        auth: true,
        component: ProjectSavePage,
        permission: [apiConfig.project.getById.permissionCode, apiConfig.project.create.permissionCode, apiConfig.project.update.permissionCode],
    },
};
