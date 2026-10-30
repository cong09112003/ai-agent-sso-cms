import React from 'react';
import { useSelector } from 'react-redux';

import { selectAppLoading } from '@selectors/app';

import { Loading } from '@components/cms';

const AppLoading = () => {
    const appLoading = useSelector(selectAppLoading);

    return <Loading show={appLoading} />;
};

export default AppLoading;
