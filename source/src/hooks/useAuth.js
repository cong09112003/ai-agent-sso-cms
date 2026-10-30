import { useSelector } from 'react-redux';

import { UserTypes } from '@constants';
import accountSelectors from '@selectors/account';
import { getCacheAccessToken } from '@services/userService';
import { accountActions } from '@store/actions';
import { jwtDecode } from 'jwt-decode';
import { useCallback } from 'react';
import useActionLoading from './useActionLoading';
import useFetchAction from './useFetchAction';

const useAuth = () => {
    const profile = useSelector(accountSelectors.selectProfile);

    const token = getCacheAccessToken();

    const immediate = !!token && !profile;

    let permissionCodes = [];
    if (token) {
        const decoded = jwtDecode(token);
        permissionCodes =
            decoded?.authorities?.length > 0 ? decoded?.authorities.map((role) => role.replace(/^ROLE_/, '')) : [];
    }

    useFetchAction(accountActions.getProfile, { immediate });

    const { loading } = useActionLoading(accountActions.getProfile.type);
    const kind = profile?.kind;
    const isAdmin = useCallback(() => {
        if (kind === UserTypes.ADMIN) return true;
        return false;
    }, [kind]);
    const isEmployee = useCallback(() => {
        if (kind === UserTypes.EMPLOYEE) return true;
        return false;
    }, [kind]);
    const isCustomer = useCallback(() => {
        if (kind === UserTypes.CUSTOMER) return true;
        return false;
    }, [kind]);

    return {
        isAdmin,
        isEmployee,
        isCustomer,
        isAuthenticated: !!profile,
        profile,
        kind,
        permissionCodes,
        token,
        loading: immediate || loading,
    };
};

export default useAuth;
