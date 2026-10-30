function HasPermission({
    children,
    requiredPermissions,
    requiredKind,
    excludeKind = [],
    path,
    onValidate,
    fallback = null,
    separate = false,
    useValidatePermission,
}) {
    const validate = useValidatePermission();
    return validate(requiredPermissions, requiredKind, excludeKind, onValidate, path, separate) ? children : fallback;
}

export default HasPermission;
