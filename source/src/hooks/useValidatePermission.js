import { validatePermission } from '@utils';
import React, { useCallback } from 'react';
import useAuth from './useAuth';

function useValidatePermission() {
    const { permissionCodes, kind, profile } = useAuth();

    const hasPermission = useCallback(
        (requiredPermissions, requiredKind, excludeKind, onValidate, path, separate) => {
            const _onValidate = onValidate ?? validatePermission;
            return _onValidate(
                requiredPermissions,
                permissionCodes,
                requiredKind,
                excludeKind,
                kind,
                profile,
                path,
                separate,
            );
        },
        [permissionCodes, kind],
    );

    return hasPermission;
}

export default useValidatePermission;
