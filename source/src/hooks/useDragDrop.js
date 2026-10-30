import React, { useEffect, useState } from 'react';
import useFetch from './useFetch';
import useNotification from './useNotification';
import { moveArrayElement } from '@utils';

const sortColumn = {
    key: 'sort',
    width: 30,
};

function useDragDrop({ data = [], apiConfig, setTableLoading, indexField, idField = 'id', dataParams }) {
    const [sortedData, setSortedData] = useState(
        (data.length > 0 && data.sort((a, b) => a?.[indexField] - b?.[indexField])) || [],
    );
    const { execute: executeOrdering, loading } = useFetch(apiConfig);
    const notification = useNotification();
    const onDragEnd = ({ id: dragId }, { id: hoverId }) => {
        if (dragId == hoverId) return;
        const dragIndex = sortedData.findIndex((item) => item.id == dragId);
        const hoverIndex = sortedData.findIndex((item) => item.id == hoverId);
        const movedData = moveArrayElement(sortedData, dragIndex, hoverIndex);
        setSortedData(movedData);
        handleUpdate(movedData);
    };
    const handleUpdate = (movedData) => {
        let dataUpdate = [];
        movedData.map((item, index) => {
            dataUpdate.push({
                [idField]: item.id,
                [indexField]: index,
            });
        });
        
        executeOrdering({
            data: {
                ...dataParams,
                orderForms: dataUpdate,
            },
            onCompleted: () => {
                notification({ type: 'success', message: 'Update success!' });
            },
            onError: (err) => {
                console.log(err);
                notification({ type: 'error', message: 'Update error!' });
            },
        });
    };

    useEffect(() => {
        if (data) setSortedData(data);
        else setSortedData([]);
    }, [data]);

    return { sortedData, onDragEnd, sortColumn, handleUpdate, loadingUpdate: loading };
}

export default useDragDrop;
