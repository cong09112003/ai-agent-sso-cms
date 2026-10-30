import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FILTER_PREFIX } from '../constants';

const useFilterStorage = () => {
    const { pathname } = useLocation();

    const buildKey = (path) => `${FILTER_PREFIX}${path}`;

    // Lưu filter vào session
    const saveFilter = useCallback(
        (queryParams) => {
            const searchString = queryParams.toString();
            if (searchString) {
                sessionStorage.setItem(buildKey(pathname), searchString);
            }
        },
        [pathname],
    );

    // Xóa filter của trang hiện tại
    const clearCurrentFilter = useCallback(() => {
        sessionStorage.removeItem(buildKey(pathname));
    }, [pathname]);

    // Xóa tất cả các filter đã lưu
    const clearAllFilters = useCallback(() => {
        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith(FILTER_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    }, []);

    // Lấy path kèm theo filter đã lưu
    const getPathWithFilter = useCallback((basePath) => {
        const [pathOnly, existingQuery] = basePath.split('?');
        const savedFilter = sessionStorage.getItem(buildKey(pathOnly));

        const params = new URLSearchParams(existingQuery || '');
        if (savedFilter) {
            const savedParams = new URLSearchParams(savedFilter);
            savedParams.forEach((value, key) => {
                params.set(key, value);
            });
        }

        const queryString = params.toString();
        return queryString ? `${pathOnly}?${queryString}` : pathOnly;
    }, []);

    return { saveFilter, clearCurrentFilter, clearAllFilters, getPathWithFilter };
};

export default useFilterStorage;
