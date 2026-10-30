import apiConfig from "@constants/apiConfig";
import CustomerListPage from ".";
import CustomerSavePage from "./CustomerSavePage";
export default {
    customerListPage: {
        path: '/customer',
        title: 'customer',
        auth: true,
        component: CustomerListPage,
        permissions: [apiConfig.customer.getList.baseURL],
    },
    customerSavePage: {
        path: '/customer/:id',
        title: 'customer Save Page',
        auth: true,
        component: CustomerSavePage,
        permissions: [apiConfig.customer.update.baseURL],
    },

};