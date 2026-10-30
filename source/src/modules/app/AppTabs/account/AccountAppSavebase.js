import { SaveOutlined, StopOutlined } from '@ant-design/icons';
import apiConfig from '@constants/apiConfig';
import { ErrorCode } from '@constants/errorCodes';
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
import AccountAppForm from './AccountForm';
const message = defineMessages({
    objectName: 'tài khoản',
});

const AccountAppSavePage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const appName = searchParams.get('appName');
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit, isSubmitting } = useSaveBase({
        apiConfig: {
            getById: apiConfig.accountApp.getById,
            create: apiConfig.accountApp.create,
            update: apiConfig.accountApp.update,
        },
        options: {
            getListUrl: routes.AccountAppListPage.path,
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
                                loading={isSubmitting}
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
                const errorCode = err.response?.data?.code;
                const errorMessage = ErrorCode[errorCode]?.message;
                if (errorMessage) {
                    showErrorMessage(errorMessage);
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
                { breadcrumbName: appName, path: generatePath(routes.AccountAppListPage.path) + location.search },
                { breadcrumbName: "Chọn tài khoản" },
            ]}
            title={title}
            loading={loading}
        >
            <AccountAppForm
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

export default AccountAppSavePage;