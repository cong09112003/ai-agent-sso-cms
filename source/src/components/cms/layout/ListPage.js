import { Card, Flex, Spin } from 'antd';
import React from 'react';

import styles from './ListPage.module.scss';
import classNames from 'classnames';

function ListPage({ searchForm, actionBar, baseTable, loading = false, children, title, style, baseListPageListClassName, actionBarWrapperClassName, ...props }) {
    return (
        <Card className={styles.baseListPage} style={style}>
            <Spin spinning={loading}>
                <div className={classNames(styles.baseListPageList, baseListPageListClassName)}>
                    <div className={styles.title}>{title}</div>
                    <Flex className={actionBarWrapperClassName} justify="space-between" align="flex-start">
                        {searchForm && <div className={styles.searchForm}>{searchForm}</div>}
                        <div className={classNames(props?.actionBarClassName)}>{actionBar}</div>
                    </Flex>
                    <div className={classNames(styles.actionBar, props?.actionBarClassName)}>{baseTable}</div>
                </div>
                <div>{children}</div>
            </Spin>
        </Card>
    );
}

export default ListPage;
