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
import AppExtraForm from './AppExtraForm';
const message = defineMessages({
    objectName: 'Mở rộng',
});

const AppExtraSavePage = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const appName = searchParams.get('appName');
    const appId = searchParams.get('appId');
    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title, setSubmit } = useSaveBase({
        apiConfig: {
            getById: apiConfig.appExtra.getById,
            create: apiConfig.appExtra.create,
            update: apiConfig.appExtra.update,
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
                    appId,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    appId,
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
                showErrorMessage('Có lỗi xảy ra. Vui lòng thử lại!');
                setSubmit(false);
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
            <AppExtraForm
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

export default AppExtraSavePage;