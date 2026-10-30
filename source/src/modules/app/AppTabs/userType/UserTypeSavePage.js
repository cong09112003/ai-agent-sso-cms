import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import { commonMessage } from '@locales/intl';
import routes from '@routes';
import { showErrorMessage } from '@services/notifyService';
import { Button, Col, Row } from 'antd';
import React from 'react';
import { defineMessages } from 'react-intl';
import { generatePath, useNavigate } from 'react-router-dom';
import UserTypeForm from './UserTypeForm';
const message = defineMessages({
    objectName: 'Loại người dùng',
});

const UserTypeSavePage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const appName = searchParams.get('appName');
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.userKind.getById,
            create: apiConfig.userKind.create,
            update: apiConfig.userKind.update,
        },
        options: {
            getListUrl: routes.AppTab.path,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                };
            };
            funcs.onBack = (isSuccess = true) => {
                navigate(-1);
            };
            funcs.renderActions = () => {
                return (
                    <Row justify="end" gutter={12}>
                        <Col>
                            <Button
                                danger
                                key="cancel"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(-1);
                                }}
                                icon={<StopOutlined />}
                            >
                                Huỷ
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                key="submit"
                                htmlType="submit"
                                type="primary"
                                form={mixinFuncs.getFormId()}
                                icon={<SaveOutlined />}
                            >
                                {isEditing ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Col>
                    </Row>
                );
            };

            funcs.onSaveError = (err) => {
                console.log('err', err);
                const errorCode = err.response?.data?.code;
                if (errorCode === 'ERROR-USER-KIND-0001') {
                    showErrorMessage('Loại người dùng đã tồn tại');
                    setSubmit(false);
                } else {
                    mixinFuncs.handleShowErrorMessage(err, showErrorMessage);
                    setSubmit(false);
                }
            };
        },
    });

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.app), path: routes.AppListPage.path },
                { breadcrumbName: appName, path: generatePath(routes.AppTab.path) + location.search },
                { breadcrumbName: title },
            ]}
            title={title}
        >
            <UserTypeForm
                setIsChangedFormValues={setIsChangedFormValues}
                dataDetail={detail ? detail : {}}
                formId={mixinFuncs.getFormId()}
                isEditing={isEditing}
                actions={mixinFuncs.renderActions()}
                onSubmit={mixinFuncs.onSave}
            />
        </PageWrapper>
    );
};

export default UserTypeSavePage;