import { AvatarField } from '@components/cms';
import useSsoFileUrl from '@hooks/useSsoFileUrl';
import React from 'react';

// AvatarField for an image stored by the SSO file-controller (the download needs the access token).
const SsoAvatar = ({ filePath, ...props }) => {
    const src = useSsoFileUrl(filePath);
    return <AvatarField src={src} {...props} />;
};

export default SsoAvatar;
