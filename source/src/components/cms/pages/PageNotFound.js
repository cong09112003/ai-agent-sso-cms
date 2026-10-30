import React from 'react';
import notFoundImage from '../images/bg_404.png';

import styles from './PageNotFound.module.scss';
import { Button } from 'antd';

const PageNotFound = () => {
    return (
        <div className={styles.pageNotFound}>
            <img alt="not-found-background" src={notFoundImage} />
            <Button
                type="primary"
                className={styles.btnRedirect}
                onClick={() => {
                    window.location.href = '/';
                }}
            >
                Quay về trang chủ
            </Button>
        </div>
    );
};

export default PageNotFound;
