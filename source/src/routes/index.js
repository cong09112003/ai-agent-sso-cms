import { PageNotAllowed, PageNotFound } from '@components/cms';
import appRoutes from '@modules/app/routes';
import companyRoutes from '@modules/company/routes';
import customerRoutes from '@modules/customer/routes';
import Dashboard from '@modules/entry';
import LoginPage, { GithubCallbackPage } from '@modules/login/index';
import managerRoutes from '@modules/manager/routes';
import ProfilePage from '@modules/profile/index';
import projectRoutes from '@modules/project/routes';
import adminsRoutes from '@modules/user/routes';

/*
	auth
		+ null: access login and not login
		+ true: access login only
		+ false: access not login only
*/
const routes = {
    pageNotAllowed: {
        path: '/not-allowed',
        component: PageNotAllowed,
        auth: null,
        title: 'Page not allowed',
    },
    homePage: {
        path: '/',
        component: Dashboard,
        auth: true,
        title: 'Home',
    },
    loginPage: {
        path: '/login',
        component: LoginPage,
        auth: false,
        title: 'Login page',
    },
    githubCallbackPage: {
        path: '/login/github/callback',
        component: GithubCallbackPage,
        auth: false,
        title: 'GitHub login callback',
    },
    profilePage: {
        path: '/profile',
        component: ProfilePage,
        auth: true,
        title: 'Profile page',
    },
    ...adminsRoutes,
    ...managerRoutes,
    ...customerRoutes,
    ...companyRoutes,
    ...projectRoutes,
    ...appRoutes,
    // keep this at last
    notFound: {
        component: PageNotFound,
        auth: null,
        title: 'Page not found',
        path: '*',
    },
};

export default routes;
