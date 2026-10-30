import { useDispatch, useSelector } from 'react-redux';

import { THEMES } from '@constants';
import { selectAppTheme } from '@selectors/app';
import { appActions } from '@store/actions';

const useTheme = () => {
    const theme = useSelector(selectAppTheme);
    const dispatch = useDispatch();
    const isDark = theme === THEMES.DARK;

    const toggleTheme = () => {
        dispatch(appActions.changeTheme(isDark ? THEMES.LIGHT : THEMES.DARK));
    };

    return {
        theme: isDark ? THEMES.DARK : THEMES.LIGHT,
        isDark,
        toggleTheme,
    };
};

export default useTheme;
