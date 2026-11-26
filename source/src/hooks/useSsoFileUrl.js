import apiConfig from '@constants/apiConfig';
import { sendRequest } from '@services/api';
import { useEffect, useState } from 'react';

// Loads a file from the SSO file-controller with the access token and returns a blob: URL for <img>/<Avatar>.
// filePath is the value saved from the upload response (e.g. account.avatarPath). Returns null while loading or on error.
const useSsoFileUrl = (filePath) => {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        setUrl(null);
        if (!filePath) return undefined;

        let cancelled = false;
        let objectUrl;
        sendRequest(apiConfig.file.ssoDownload, {
            pathParams: { filePath: filePath.replace(/^\/+/, '') },
            mixinFuncs: { responseType: 'blob' },
        })
            .then(({ data }) => {
                if (cancelled) return;
                objectUrl = URL.createObjectURL(data);
                setUrl(objectUrl);
            })
            .catch(() => {
                // The avatar falls back to its icon; nothing else depends on this image.
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [filePath]);

    return url;
};

export default useSsoFileUrl;
