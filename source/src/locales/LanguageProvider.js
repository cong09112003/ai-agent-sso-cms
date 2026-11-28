import React from 'react';
import { IntlProvider } from 'react-intl';

import { defaultLocale } from '@constants';
import useLocale from '@hooks/useLocale';
import { setApiLocale } from '@services/api';

// Every src/locales/<code>.json becomes a message catalog keyed by <code> (register the language in constants `languages`)
const localeContext = require.context('./', false, /^\.\/[a-zA-Z-]+\.json$/);
const messages = {};
localeContext.keys().forEach((key) => {
    messages[key.replace(/^\.\/|\.json$/g, '')] = localeContext(key);
});

const LanguageProvider = ({ children }) => {
    const { locale } = useLocale();
    // Set during render so requests fired by children's first effects already carry the right Accept-Language
    setApiLocale(locale);

    return (
        <IntlProvider
            locale={locale}
            messages={messages[locale]}
            defaultLocale={defaultLocale}
            onError={(e) => {}}
        >
            {children}
        </IntlProvider>
    );
};

export default LanguageProvider;
