import apiConfig from '@constants/apiConfig';
import useSaveBase from '@hooks/useSaveBase';
import useTranslate from '@hooks/useTranslate';
import { PageWrapper } from '@components/cms';
import React from 'react';
import { defineMessages } from 'react-intl';
import CustomerForm from './CustomerForm';
import routes from './routes';
const message = defineMessages({
    objectName: 'Khách hàng',
});

const CustomerSavePage = () => {
    const translate = useTranslate();

    const { detail, mixinFuncs, loading, setIsChangedFormValues, isEditing, title } = useSaveBase({
        apiConfig: {
            getById: apiConfig.customer.getById,
            create: apiConfig.customer.create,
            update: apiConfig.customer.update,
        },
        options: {
            getListUrl: routes.customerListPage.path,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.prepareUpdateData = (data) => {
                return {
                    ...data,
                    id: detail.id,
                    status: 1,
                };
            };
            funcs.prepareCreateData = (data) => {
                return {
                    ...data,
                    status: 1,
                };
            };
        },
    });


    const setBreadRoutes = () => {
        const breadRoutes = [{ breadcrumbName: translate.formatMessage(message.objectName), path: routes.customerListPage.path },
            { breadcrumbName: title },
        ];
        // breadRoutes.push({ breadcrumbName: translate.formatMessage(message.objectName) });
        return breadRoutes;
    };

    return (
        <PageWrapper routes={setBreadRoutes()}>
            <CustomerForm
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

export default CustomerSavePage;