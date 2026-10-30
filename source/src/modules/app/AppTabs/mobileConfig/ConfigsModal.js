import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { BaseTable } from '@components/cms';
import { showErrorMessage, showSucsessMessage } from '@services/notifyService';
import { Button, Col, Form, Input, Modal, Row, Select, Space } from 'antd';
import React, { useState } from 'react';
const { confirm } = Modal;

const ConfigsModal = ({ apiUrls, setApiUrls, setIsChangedFormValues, disabled }) => {
    const [formData, setFormData] = useState({ name: '', url: '' });
    const [editingIndex, setEditingIndex] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCustom, setIsCustom] = useState(false);

    const defaultOptions = [
        { value: 'APP_URL', label: 'APP_URL' },
        { value: 'MEDIA_URL', label: 'MEDIA_URL' },
        { value: 'SITE_URL', label: 'SITE_URL' },
        { value: 'CUSTOM', label: 'Tùy chỉnh...' },
    ];

    const handleDelete = (index) => {
        confirm({
            title: `Bạn có chắc chắn muốn xóa API ${apiUrls[index].name} này không?`,
            okText: 'Có',
            cancelText: 'Không',
            cancelButtonProps: {
                style: {
                    color: 'red', 
                    borderColor: 'red',
                },
            },
            onOk() {
                const newData = apiUrls.filter((_, i) => i !== index);
                setApiUrls(newData);
                setIsChangedFormValues(true);
                showSucsessMessage('Đã xóa thành công' );
            },
        });
    };

    const showModal = (index) => {
        setEditingIndex(index);
        if (index !== null) {
            const item = apiUrls[index];
            const isDefault = defaultOptions.some(opt => opt.value === item.name && opt.value !== 'CUSTOM');
            
            setFormData({
                name: isDefault ? item.name : 'CUSTOM',
                url: item.url,
                customName: isDefault ? '' : item.name,
            });
            setIsCustom(!isDefault);
        } else {
            setFormData({ name: '', url: '', customName: '' });
            setIsCustom(false);
        }
        setIsModalVisible(true);
    };

    const handleOk = () => {
        const finalName = isCustom ? formData.customName : formData.name;

        if (!finalName || !formData.url) {
            showErrorMessage('Vui lòng nhập đầy đủ Tên và Giá trị');
            return;
        }

        //check trùng name
        const isDuplicate = apiUrls.some((item, index) => 
            item.name.toLowerCase() === finalName.toLowerCase() && index !== editingIndex,
        );

        if (isDuplicate) {
            showErrorMessage('Tên đã tồn tài');
            return;
        }

        const newEntry = { name: finalName, url: formData.url };
        let newData = [...apiUrls];

        if (editingIndex !== null) {
            newData[editingIndex] = newEntry;
        } else {
            newData.push(newEntry);
        }

        setApiUrls(newData);
        setIsChangedFormValues(true);
        setIsModalVisible(false);
    };

    const handleSelectChange = (value) => {
        setIsCustom(value === 'CUSTOM');
        setFormData({ ...formData, name: value });
    };

    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Giá trị', dataIndex: 'url', key: 'url' },
        {
            title: 'Hành động',
            key: 'action',
            align: 'right',
            render: (_, record, index) => (
                <Space size="middle">
                    <EditOutlined 
                        style={{ 
                            color: disabled ? '#ccc' : 'blue', 
                            cursor: disabled ? 'not-allowed' : 'pointer', 
                        }} 
                        onClick={() => !disabled && showModal(index)} 
                    />
                    <DeleteOutlined 
                        style={{ 
                            color: disabled ? '#ccc' : 'red', 
                            cursor: disabled ? 'not-allowed' : 'pointer', 
                        }} 
                        onClick={() => !disabled && handleDelete(index)} 
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
                        <span>
                            Cấu hình <span style={{ color: 'red' }}>*</span>
                        </span>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal(null)} disabled={disabled}>
                            Thêm
                        </Button>
                    </div>
                    <BaseTable dataSource={apiUrls} columns={columns} pagination={false} />
                </Col>
            </Row>

            <Modal
                title={editingIndex !== null ? 'Chỉnh sửa' : 'Thêm mới'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
                maskClosable={false}
                cancelButtonProps={{ style: { color: 'red', borderColor: 'red' } }}
            >
                <Form layout="vertical">
                    <Form.Item label="Tên" required>
                        <Select
                            placeholder="Chọn tên"
                            value={formData.name || undefined}
                            onChange={handleSelectChange}
                            options={defaultOptions}
                            getPopupContainer={(trigger) => trigger.parentNode}
                        />
                    </Form.Item>

                    {isCustom && (
                        <Form.Item label="Nhập tên tùy chỉnh" required>
                            <Input
                                placeholder="Nhập tên tùy chỉnh"
                                value={formData.customName}
                                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                                autoFocus
                            />
                        </Form.Item>
                    )}
                    <Form.Item label="Giá trị" required>
                        <Input 
                            placeholder="Nhập giá trị"
                            value={formData.url} 
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ConfigsModal;
