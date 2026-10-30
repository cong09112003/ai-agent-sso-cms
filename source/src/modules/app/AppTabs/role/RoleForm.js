import apiConfig from '@constants/apiConfig';
import useBasicForm from '@hooks/useBasicForm';
import useFetch from '@hooks/useFetch';
import useTranslate from '@hooks/useTranslate';
import { SelectField, TextField } from '@components/cms';
import { commonMessage } from '@locales/intl';
import { Card, Checkbox, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import '../../index.module.scss';
const message = defineMessages({
    deleteConfirm: {
        title: {
            id: 'hook.useListBase.deleteConfirm.title',
            defaultMessage: 'Bạn có chắc chắn muốn xóa {objectName} này không?',
        },
        ok: {
            id: 'hook.useListBase.deleteConfirm.ok',
            defaultMessage: 'Có',
        },
        cancel: {
            id: 'hook.useListBase.deleteConfirm.cancel',
            defaultMessage: 'Không',
        },
    },
});

const RoleForm = (props) => {
    const {
        formId,
        actions,
        dataDetail,
        onSubmit,
        setIsChangedFormValues,
        isEditing,
        //permissions,
        size = 'small',
    } = props;
    const translate = useTranslate();
    const intl = useIntl();
    const [group, setGroup] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState(null);
    const [detail, setDetail] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [checkPermissionChange, setCheckPermissionChange] = useState(false);
    const [isEditingPermission, setIsEditingPermission] = useState(false);
    const [isAddingPermission, setIsAddingPermission] = useState(false);
    const { form, mixinFuncs, onValuesChange } = useBasicForm({
        onSubmit,
        setIsChangedFormValues,
    });
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const appId = queryParams.get('appId');
    const appName = queryParams.get('appName');
    const [checkedCount, setCheckedCount] = useState(0);
    const [checkedGroups, setCheckedGroups] = useState({});
    const watchedPermissions = Form.useWatch('permissions', form);


    const { data: dataUserKind } = useFetch(apiConfig.userKind.getList, {
        immediate: true,
        params: { appId: appId },
        mappingData: ({ data }) => {
            const dataCustom = data.content.map((item) => {
                return {
                    value: item.id,
                    label: item.name,
                    kind: item.kind,
                };
            });
            return dataCustom;
        },
    });
    const { execute: executeGetPermission, loading } = useFetch(apiConfig.permission.getList, {
        immediate: false,
        params: { appId: appId, size: 1000 },
        mappingData: (response) => {
            if (response.result === true) {
                return response.data.map((permission) => permission.id);
            }
            return [];
        },
    });
    const { data: dataGroup, execute: executeListGroup } = useFetch(apiConfig.permissionGroup.getList, {
        immediate: true,
        params: { appId: appId },
    });
    const { execute: executeGetPermissionById } = useFetch(apiConfig.permission.getById, { immediate: false });

    useEffect(() => {
        executeGetPermission({
            onCompleted: (res) => {
                setPermissions(res?.data);
            },
        });
    }, []);

    const handleSubmit = (values) => {
        const currentPermissions = form.getFieldValue('permissions') || [];

        if (checkedCount === 0) {
            values.permissions = currentPermissions;
        } else {
            values.permissions = [...currentPermissions];
        }

        return mixinFuncs.handleSubmit({ ...values, appId: appId });
    };

    const handleCheckAllGroup = (e, group) => {
        if (e && e.stopPropagation) e.stopPropagation();
        const currentPermissions = form.getFieldValue('permissions') || [];
        const groupPermissionIds = group.permissions.map(p => p.id);

        const allChecked = groupPermissionIds.every(id => currentPermissions.includes(id));

        let newPermissions;
        if (allChecked) {
            newPermissions = currentPermissions.filter(id => !groupPermissionIds.includes(id));
        } else {
            newPermissions = Array.from(new Set([...currentPermissions, ...groupPermissionIds]));
        }

        form.setFieldsValue({ permissions: newPermissions });

        onValuesChange({ permissions: newPermissions }, form.getFieldsValue());

        setCheckedGroups(prev => ({
            ...prev,
            [group.id]: !allChecked,
        }));
    };

    const handleGroupCheckboxChange = (group, checkedValues) => {
        const allPermissions = form.getFieldValue('permissions') || [];
        const filtered = allPermissions.filter(id => !group.permissions.some(p => p.id === id));
        const newPermissions = [...filtered, ...checkedValues];
        form.setFieldsValue({ permissions: newPermissions });
        onValuesChange({ permissions: newPermissions }, form.getFieldsValue());

        setCheckedGroups(prev => ({
            ...prev,
            [group.id]: group.permissions.every(p => newPermissions.includes(p.id)),
        }));
    };

    const getGroupPermission = () => {
        let groups = [];
        if (permissions && permissions.length > 0) {
            groups = permissions.reduce((r, a) => {
                const groupName = a.permissionGroup.name;
                const groupId = a.permissionGroup.id;

                const existingGroup = r.find((group) => group.name === groupName);
                
                if (!existingGroup) {
                    r.push({
                        name: groupName,
                        id: groupId,
                        permissions: [a],
                    });
                } else {
                    existingGroup.permissions.push(a);
                    existingGroup.permissions.sort((a, b) =>
                        a.pcode.localeCompare(b.pcode),
                    );
                }

                return r;
            }, []);
        }
        if (dataGroup?.data?.content?.length > 0) {
            dataGroup.data.content.forEach((item) => {
                const existingGroup = groups.find((group) => group.id === item.id);
                if (!existingGroup) {
                    groups.push({
                        name: item.name,
                        id: item.id,
                        permissions: [],
                    });
                }
            });
        }
        // console.log(groups);
        
        setGroup(groups);
    };

    useEffect(() => {
        form.setFieldsValue({
            ...dataDetail,
            userKindId: dataDetail?.userKind?.id,
        });
    }, [dataDetail]);

    useEffect(() => {
        if (permissions.length === 0) {
            getGroup();
        } else {
            getGroupPermission();
        }
    }, [permissions, dataGroup]);

    const getGroup = () => {
        if (dataGroup && dataGroup.data && dataGroup.data.content && dataGroup.data.content.length > 0) {
            const groups = dataGroup.data.content.map((item) => ({
                name: item.name,
                id: item.id,
                permissions: [],
            }));
            setGroup(groups);
        }
    };

    const handleAddPermission = (groupName, id) => {
        setSelectedGroupName(groupName);
        setDetail(id), setIsEditingPermission(false);
        setIsAddingPermission(true);
    };

    const handleCheckboxChange = (checkedValues) => {
        setCheckedCount(checkedValues.length);
    };
    useEffect(() => { }, [checkedCount]);

    useEffect(() => {
        if (group.length > 0 && watchedPermissions) {
            const selectedPermissions = watchedPermissions;
            const initialCheckedGroups = {};

            group.forEach(g => {
                initialCheckedGroups[g.id] = g.permissions.length > 0
                    ? g.permissions.every(p => selectedPermissions.includes(p.id))
                    : false;
            });

            setCheckedGroups(initialCheckedGroups);
        }
    }, [group, watchedPermissions]);

    return (
        <>
            <Form
                style={{ width: '1000px' }}
                id={formId}
                onFinish={handleSubmit}
                form={form}
                layout="vertical"
                onValuesChange={onValuesChange}
            >
                <Card className="card-form" bordered={false}>
                    <Row gutter={12}>
                        <Col span={12}>
                            <TextField label={translate.formatMessage(commonMessage.Name)} required name="name" />
                        </Col>
                        <Col span={12}>
                            <TextField label={translate.formatMessage(commonMessage.Key)} name="keyRole" />
                        </Col>
                        <Col span={12}>
                            <SelectField
                                required
                                label={translate.formatMessage(commonMessage.userType)}
                                name={['userKindId']}
                                options={dataUserKind}
                                allowClear={false}
                            />
                        </Col>
                        <Col span={12}>
                            <TextField
                                label={translate.formatMessage(commonMessage.description)}
                                required
                                type="textarea"
                                name="description"
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="permissions"
                                getValueFromEvent={(e) => {
                                    //đây tránh convert number cửa Antd
                                    if (e && e.target) {
                                        return form.getFieldValue('permissions'); 
                                    }
                                    return Array.isArray(e) ? e.map(v => String(v)) : [];
                                }}
                                label={
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontWeight: 600,
                                            fontSize: 16,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {translate.formatMessage(commonMessage.permission)} - ({form.getFieldValue("permissions")?.length} / {permissions?.length} quyền được cấp)
                                    </div>
                                }
                            >
                                {group.map((currentGroup) => (
                                    <Card
                                        key={currentGroup.id}
                                        size="small"
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 8 }}>
                                                {currentGroup.permissions.length > 0 && (
                                                    <Checkbox
                                                        checked={checkedGroups[currentGroup.id] || false}
                                                        onChange={(e) => handleCheckAllGroup(e, currentGroup)}
                                                    />
                                                )}
                                                <span>{currentGroup.name}</span>
                                            </div>
                                        }
                                        style={{ width: '100%', marginBottom: 30 }}
                                    >
                                        {currentGroup.permissions.length > 0 ? (
                                            <Checkbox.Group
                                                style={{ width: "100%" }}
                                                value={form.getFieldValue('permissions')?.filter(id =>
                                                    currentGroup.permissions.some(p => p.id === id),
                                                )}
                                                onChange={(checkedValues) => handleGroupCheckboxChange(currentGroup, checkedValues)}
                                            >
                                                <Row gutter={24}>
                                                    {currentGroup.permissions.map((permission) => (
                                                        <Col span={8} key={permission.id}>
                                                            <Checkbox value={permission.id}>{permission.name}</Checkbox>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Checkbox.Group>
                                        ) : (
                                            <div style={{ textAlign: 'center', color: 'gray' }}>Chưa có quyền</div>
                                        )}
                                    </Card>
                                ))}
                            </Form.Item>
                        </Col>
                    </Row>
                    <div className="footer-card-form">{actions}</div>
                </Card>
            </Form>
        </>
    );
};

export default RoleForm;
