import React from 'react';
import { Breadcrumb, Button, Spin, Tabs } from 'antd';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';

import styles from './PageWrapper.module.scss';
import { commonMessage } from '@locales/intl';
import useTranslate from '@hooks/useTranslate';
import useFilterStorage from '../hooks/useFilterStorage';

const PageWrapper = ({ loading, children, routes = [], tabs, onChangeTab, activeTab }) => {
    const hasTab = !!tabs?.length;
    const navigate = useNavigate();
    const { getPathWithFilter } = useFilterStorage();
    const translate = useTranslate();
    routes = [{ breadcrumbName: translate.formatMessage(commonMessage.home), path: '/' }, ...routes];

    return (
        <Spin spinning={!!loading} wrapperClassName={styles.pageWrapper}>
            <div className={classNames(styles.pageHeader, hasTab && styles.hasTab)}>
                {!!routes?.length && (
                    <Breadcrumb
                        items={routes}
                        itemRender={(route) => {
                            const last = routes.indexOf(route) === routes.length - 1;

                            if (last) {
                                return (
                                    <span className={styles.breadcrumbLast}>{route.breadcrumbName || route.title}</span>
                                );
                            } else if (route.path) {
                                const fullPath = getPathWithFilter(route.path);
                                return (
                                    <Button
                                        onClick={() => navigate(fullPath)}
                                        type='link'
                                        style={{
                                            padding: 0,
                                            height: 0,
                                        }}
                                    >
                                        {route.breadcrumbName || route.title}
                                    </Button>
                                );
                            } else {
                                return <span>{route.breadcrumbName || route.title}</span>;
                            }
                        }}
                    />
                )}
                {!!tabs?.length && (
                    <Tabs activeKey={activeTab} onChange={onChangeTab} items={tabs} className={styles.tab} />
                )}
            </div>
            <div className={styles.pageContent}>{children}</div>
        </Spin>
    );
};
export default PageWrapper;
