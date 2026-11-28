import { useDispatch, useSelector } from 'react-redux';

import { defaultLocale, languages, locales } from '@constants';
import { selectAppLocale } from '@selectors/app';
import { appActions } from '@store/actions';

// The chosen locale lives in redux (app.locale), which is persisted to localStorage by the reducer storage whitelist
const useLocale = () => {
    const locale = useSelector(selectAppLocale);
    const dispatch = useDispatch();

    return {
        locale: locales.includes(locale) ? locale : defaultLocale,
        languages,
        changeLocale: (code) => {
            if (locales.includes(code)) dispatch(appActions.changeLanguage(code));
        },
    };
};

export default useLocale;
