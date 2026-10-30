import React from 'react';
import styles from './PageUnauthorized.module.scss';

const PageUnauthorized = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>403</h1>
            <h2 className={styles.subtitle}>Forbidden</h2>
            <p className={styles.text}>Access to this resource on the server is denied!</p>
        </div>
    );
};

export default PageUnauthorized;