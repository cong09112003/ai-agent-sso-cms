import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { BaseTable } from '@components/cms';
import { Button, Col, Form, Input, Modal, notification, Row, Select, Space } from 'antd';
import React, { useState } from 'react';
const { confirm } = Modal;

const SettingsModal = ({ arraySetting, setArraySetting, setIsChangedFormValues }) => {
    const [formData, setFormData] = useState({ key: '', value: '' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [isEditting, setIsEditting] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isCustomKey, setIsCustomKey] = useState(false);
    const showModal = (index) => {
        if (index !== null) {
            setIsEditting(true);
        } else {
            setIsEditting(false);
        }

        setEditingIndex(index);
        if (index !== null) {
            const setting = arraySetting[index];
            setFormData({
                key: setting.key,
                value: setting.key === 'isSuperAdmin' ? setting.value.toString() : setting.value,
            });
        } else {
            setFormData({ key: '', value: '' });
        }
        setIsModalVisible(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const showDeleteConfirm = (record, index) => {
        confirm({
            title: 'Bạn có chắc chắn muốn xóa không?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                handleDelete(record, index);
            },
            onCancel() {},
        });
    };

    const handleDelete = (record, index) => {
        const newData = arraySetting.filter((item, i) => i !== index);
        setArraySetting(newData);
        setIsChangedFormValues(true);
    };
    const handleOk = () => {

        const finalKey = isCustomKey && formData.keyCustom ? formData.keyCustom : formData.key;

        if (finalKey === 'isSuperAdmin' && !['true', 'false'].includes(formData.value)) {
            notification.error({
                message: 'Giá trị không hợp lệ',
                description: 'Giá trị cho Key "isSuperAdmin" chỉ có thể là "true" hoặc "false".',
            });
            return;
        }
        const keyExists = arraySetting.some((item, index) => item.key === finalKey && index !== editingIndex);
        if (keyExists) {
            notification.error({
                message: 'Key đã tồn tại',
                description: 'Key này đã được sử dụng. Vui lòng nhập một Key khác.',
            });
            return;
        }
        const updatedFormData = {
            ...formData,
            key: finalKey, 
            value: finalKey === 'isSuperAdmin' ? formData.value === 'true' : formData.value,
        };

        if (editingIndex !== null) {
            if (formData.key === 'isSuperAdmin' && !['true', 'false'].includes(formData.value)) {
                notification.error({
                    message: 'Giá trị không hợp lệ',
                    description: 'Giá trị cho Key "isSuperAdmin" chỉ có thể là "true" hoặc "false".',
                });
                return;
            }
            setArraySetting((prev) => {
                const updatedArray = [...prev];
                updatedArray[editingIndex] = updatedFormData;
                return updatedArray;
            });
        } else {
            setArraySetting((prev) => [...prev, updatedFormData]);
        }
        setIsCustomKey(false);
        setIsChangedFormValues(true);
        setIsModalVisible(false);
        setEditingIndex(null);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingIndex(null);
        setFormData({ key: '', value: '' });
        setIsCustomKey(false);
    };

    const handleCustomKey = (e) => {
        const { value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            keyCustom: value, 
        }));
    };

    const handleKeyChange = (value) => {
        if (value === 'custom') {
            setIsCustomKey(true);
            setFormData((prevData) => ({ ...prevData, key: value }));
        } else {
            setIsCustomKey(false);
            setFormData((prevData) => ({ ...prevData, key: value, value: value === 'isSuperAdmin' ? 'false' : '' }));
        }
    };
    const columns = [
        { title: 'Key', dataIndex: 'key', key: 'key' },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text, record) => (record.key === 'isSuperAdmin' ? record.value.toString() : record.value),
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'right',
            render: (text, record, index) => (
                <Space size="middle">
                    <EditOutlined style={{ color: 'blue', cursor: 'pointer' }} onClick={() => showModal(index)} />
                    <DeleteOutlined
                        style={{
                            color: record.deletable === false ? 'grey' : 'red',
                            cursor: record.deletable === false ? 'not-allowed' : 'pointer',
                        }}
                        onClick={record.deletable !== false ? () => showDeleteConfirm(record, index) : null}
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <Row gutter={10}>
                <Col span={24}>
                    <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Settings</span>
                        <Button type="primary" style={{ paddingLeft: 10 }} onClick={() => showModal(null)}>
                            <PlusOutlined /> Thêm mới
                        </Button>
                    </div>
                </Col>
                <Col span={24}>
                    <BaseTable dataSource={arraySetting} columns={columns} style={{ cursor: 'pointer' }} />
                </Col>
            </Row>

            <Modal
                title={editingIndex !== null ? 'Chỉnh sửa Setting' : 'Thêm mới Setting'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                cancelButtonProps={{ style: { color: 'red', borderColor: 'red' } }}
            >
                <Form layout="vertical">
                    <Col span={24}>
                        <Form.Item label="Key" required>
                            <Select                               
                                value={formData.key === '' ? undefined : formData.key}
                                disabled={isEditting}
                                placeholder="Chọn key"
                                onChange={handleKeyChange}
                                getPopupContainer={(trigger) => trigger.parentNode}
                                options={[
                                    { value: 'isSuperAdmin', label: 'isSuperAdmin' },
                                    { value: 'tenantId', label: 'tenantId' },
                                    { value: 'mediaAppId', label: 'mediaAppId' },
                                    { value: 'custom', label: 'Custom Key' },
                                ]}
                            />

                            {isCustomKey && (
                                <Input
                                    placeholder="Nhập Key tùy chỉnh"
                                    name="key"
                                    value={formData.keyCustom}
                                    onChange={handleCustomKey}
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Value" required>
                            {formData.key === 'isSuperAdmin' ? (
                                <Select
                                    placeholder="Chọn Value"
                                    value={formData.value}
                                    onChange={(value) => setFormData((prev) => ({ ...prev, value }))}
                                    getPopupContainer={(trigger) => trigger.parentNode}
                                    options={[
                                        { value: 'true', label: 'true' },
                                        { value: 'false', label: 'false' },
                                    ]}
                                />
                            ) : (
                                <Input
                                    placeholder="Nhập Value"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Form>
            </Modal>
        </>
    );
};

export default SettingsModal;
