import React, { useEffect, useState } from 'react';
import { Table } from 'antd';

import styles from './BaseTable.module.scss';
import classNames from 'classnames';

const BaseTable = ({
    dataSource,
    onChange,
    rowSelection,
    columns = [],
    loading,
    pagination,
    rowKey = (record) => record.id,
    pageLocal = false,
    onPaginationChange,
    onResetPage, 
    rowClassName,
    className,
    scroll,
    ...props
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [paginatedData, setPaginatedData] = useState([]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        if (pageLocal) {
            setPaginatedData(dataSource.slice(startIndex, endIndex));
        }
    }, [currentPage, pageSize, dataSource]);

    const resetToFirstPage = () => {
        setCurrentPage(1);
        if (onPaginationChange) {
            onPaginationChange({ current: 1, pageSize: pageSize });
        }
    };

    // Gọi hàm reset từ bên ngoài
    useEffect(() => {
        if (onResetPage) {
            onResetPage(resetToFirstPage);
        }
    }, [onResetPage]);

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
        if (onPaginationChange) {
            console.log(pagination);
            onPaginationChange(pagination);
        }
    };

    return (
        <Table
            scroll={scroll || { x: 'max-content' }}
            columns={columns.filter(Boolean)}
            dataSource={pageLocal ? paginatedData : dataSource}
            loading={loading}
            rowKey={rowKey}
            pagination={
                pagination
                    ? { ...pagination, showSizeChanger: false, hideOnSinglePage: true }
                    : pageLocal
                        ? {
                            current: currentPage,
                            pageSize: pageSize,
                            total: dataSource.length,
                            // showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                            showSizeChanger: false,
                            hideOnSinglePage: true,
                        }
                        : false
            }
            onChange={pageLocal ? handleTableChange : onChange}
            rowSelection={rowSelection}
            {...props}
            className={classNames(styles.baseTable, className)}
            // rowClassName={classNames(styles.customRow, rowClassName)}
            rowClassName={(record, index) => {
                let extraClassName = '';
                if (typeof rowClassName === 'function') {
                    extraClassName = rowClassName(record, index);
                } else if (typeof rowClassName === 'string') {
                    extraClassName = rowClassName;
                }
                return classNames(styles.customRow, extraClassName);
            }}
        />
    );
};

export default BaseTable;
