import { PageNotAllowed, PageNotFound } from '@components/cms';
import appRoutes from '@modules/app/routes';
import customerRoutes from '@modules/customer/routes';
import Dashboard from '@modules/entry';
import LoginPage from '@modules/login/index';
import managerRoutes from '@modules/manager/routes';
import ProfilePage from '@modules/profile/index';
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
    profilePage: {
        path: '/profile',
        component: ProfilePage,
        auth: true,
        title: 'Profile page',
    },
    ...adminsRoutes,
    ...managerRoutes,
    ...customerRoutes,
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
