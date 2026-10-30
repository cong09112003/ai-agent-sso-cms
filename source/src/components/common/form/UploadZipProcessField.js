import React, { useState } from 'react';
import Cloud from '@assets/icons/upload.svg';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { IconFileUpload } from '@tabler/icons-react';
import { Button, ConfigProvider, Form, Progress } from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import Upload from 'antd/es/upload/Upload';

import styles from './UploadZipProcessField.module.scss';

function UploadZipProcessField({
    required,
    label,
    formItemProps,
    objectName = '',
    options = {},
    setIsChange,
    disabled,
    onChange,
    isEditing,
    name,
    updateZipInfo,
    zipInfo,
}) {
    const checkFileLink = (_, value) => {
        if (value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('This field is required!'));
    };

    return (
        <Form.Item
            {...formItemProps}
            rules={[{ validator: checkFileLink }]}
            required={required}
            label={label}
            name={name}
        >
            <VideoField
                disabled={disabled}
                objectName={objectName}
                options={options}
                setIsChange={setIsChange}
                onChange={onChange}
                updateZipInfo={updateZipInfo}
                zipInfo={zipInfo}
            />
        </Form.Item>
    );
}

function VideoField({ value = '', onChange, options = {}, setIsChange, updateZipInfo, zipInfo }) {
    const { execute: executeUpFile } = useFetch(apiConfig.file.upload);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const translate = useTranslate();

    const mixinFuncs = {
        mixinFuncs: {
            onUploadProgress: (event) => {
                const percent = Math.floor((event.loaded / event.total) * 100);
                setProgress(percent);
                if (percent === 100) {
                    setTimeout(() => setProgress(0), 1000);
                }
            },
        },
    };
    const uploadFile = ({ file, onSuccess, onError, options }) => {
        updateZipInfo('file', file);
        // setUploadLoading(true);
        // executeUpFile({
        //     data: {
        //         type: 'DATA',
        //         file: file,
        //         ...options,
        //     },
        //     ...mixinFuncs,
        //     onCompleted: (result) => {
        //         onChange(result.data.filePath);
        //         onSuccess();
        //         setUploadLoading(false);
        //         updateZipInfo('filePath', result.data.filePath);
        //     },
        //     onError: (error) => {
        //         onError();
        //         setErrorMessage('Upload file fail');
        //         setUploadLoading(false);
        //     },
        // });
    };
    const renderContent = () => {
        if (uploadLoading) {
            return (
                <>
                    <Upload style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', flexDirection: 'column' }}>
                        {progress > 0 ? <Upload style={{ fontWeight: "bold" }}>{`Đang tải file...${progress} %`}</Upload> : null}
                        {progress > 0 ? (
                            <Progress
                                percent={progress}
                                strokeColor={'blue'}
                                showInfo={false}
                                style={{ marginBottom: '10px', padding: '0 20px', width: '500px' }}
                            />
                        ) : null}


                    </Upload>
                    {progress > 0 && zipInfo?.name && (
                        <div className={styles.box}>
                            <div className={styles.desc}>
                                <span className={styles.descTitle}>Tên file</span>
                                <p className={styles.descNameFile}>{zipInfo?.name}</p>
                            </div>
                        </div>
                    )}
                </>
            );
        }
        if (errorMessage) {
            return <div style={{ color: 'red' }}>{errorMessage}</div>;
        }
        return (
            zipInfo?.name ?
                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <IconFileUpload color='#808080' size={80} />
                    <span>

                        {zipInfo?.name}
                    </span>
                </div>
                : <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <img src={Cloud} alt='' />
                    <Button
                        style={{
                            fontSize: 12,
                            color: 'Blue',
                            background: 'var(--primary-color)',
                            padding: '10px',
                            borderRadius: '5px',
                        }}
                    >
                        {translate.formatMessage(commonMessage.uploadFile)}
                    </Button>
                </div>
        );
    };
    const handleFileUpload = (info) => {
        updateZipInfo('name', info.file.name);
        // Logic of action you want to perform on file upload
    };
    return (
        <>
            <ConfigProvider
                theme={{
                    token: {
                        // Seed Token
                        colorPrimary: 'blue',
                        borderRadius: 2,

                        // Alias Token
                        colorBgContainer: '#f6ffed',
                        margin: 0,
                        padding: 0,
                    },
                }}
            >
                <Dragger
                    disabled={uploadLoading}
                    accept=".json"
                    showUploadList={false}
                    customRequest={({ file, onSuccess, onError }) => {
                        uploadFile({ file, onSuccess, onError, options });
                    }}
                    height={200}
                    maxCount={1}
                    onChange={handleFileUpload}
                    style={{ position: 'relative' }}
                >
                    {renderContent()}
                </Dragger>
            </ConfigProvider>
        </>
    );
}

export default UploadZipProcessField;
