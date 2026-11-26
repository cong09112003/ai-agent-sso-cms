import apiConfig from '@constants/apiConfig';
import { sendRequest } from '@services/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppSavePage from './AppSavebase';

jest.mock('@services/api', () => ({ sendRequest: jest.fn() }));
jest.mock('@routes', () => ({ AppListPage: { path: '/app' } }));
jest.mock('@hooks/useNotification', () => () => jest.fn());
// AppForm hides the url field for the SSO app itself, and appId comes from an env value that is unset under Jest.
jest.mock('@constants', () => {
    const actual = jest.requireActual('@constants');
    return { ...actual, AppConstants: { ...actual.AppConstants, appId: 'sso-app' } };
});
// babel-plugin-react-intl-auto doesn't run under Jest, so messages have no generated ids.
jest.mock('react-intl', () => ({
    ...jest.requireActual('react-intl'),
    defineMessages: (messages) =>
        Object.keys(messages).reduce(
            (result, key) => ({ ...result, [key]: { id: key, defaultMessage: messages[key] } }),
            {},
        ),
    FormattedMessage: ({ defaultMessage }) => defaultMessage,
}));

window.matchMedia =
    window.matchMedia ||
    (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));

const renderPage = () =>
    render(
        <IntlProvider locale="vi" onError={() => {}}>
            <MemoryRouter initialEntries={['/app/create']}>
                <Routes>
                    <Route path="/app/:id" element={<AppSavePage />} />
                </Routes>
            </MemoryRouter>
        </IntlProvider>,
    );

const fillBasicFields = () => {
    fireEvent.change(screen.getByLabelText('Tên ứng dụng'), { target: { value: 'App A' } });
    fireEvent.change(screen.getByLabelText('Url api'), { target: { value: 'https://a.test' } });
    fireEvent.change(screen.getByLabelText('Mô tả'), { target: { value: 'desc' } });
};

const toggleFlash = () => fireEvent.click(screen.getByRole('switch'));

const submit = () => fireEvent.click(document.querySelector('button[type="submit"]'));

const callsTo = (endpoint) => sendRequest.mock.calls.filter(([config]) => config === endpoint);

describe('AppSavePage create', () => {
    beforeEach(() => {
        sendRequest.mockReset();
        sendRequest.mockResolvedValue({
            data: { result: true, data: { content: [{ id: 5, fullName: 'Admin A' }] } },
        });
    });

    it('calls app/create without admin fields when the option is off', async () => {
        renderPage();
        fillBasicFields();
        submit();

        await waitFor(() => expect(callsTo(apiConfig.app.create)).toHaveLength(1));
        expect(callsTo(apiConfig.app.create)[0][1].data).toEqual({
            name: 'App A',
            url: 'https://a.test',
            description: 'desc',
            settings: '{}',
        });
        expect(callsTo(apiConfig.app.createFlash)).toHaveLength(0);
    });

    it('calls app/create-flash with the admin and permission groups when the option is on', async () => {
        renderPage();
        fillBasicFields();
        toggleFlash();

        fireEvent.change(await screen.findByLabelText('Tên nhóm quyền'), { target: { value: 'Group 1' } });
        fireEvent.mouseDown(screen.getByLabelText('Tài khoản admin'));
        fireEvent.click(await screen.findByText('Admin A'));
        submit();

        await waitFor(() => expect(callsTo(apiConfig.app.createFlash)).toHaveLength(1));
        expect(callsTo(apiConfig.app.createFlash)[0][1].data).toEqual({
            name: 'App A',
            url: 'https://a.test',
            description: 'desc',
            settings: '{}',
            accountId: 5,
            permissionGroups: [{ name: 'Group 1' }],
        });
        expect(callsTo(apiConfig.app.create)).toHaveLength(0);
    });

    it('sends nothing when the option is on and the admin fields are empty', async () => {
        renderPage();
        fillBasicFields();
        toggleFlash();
        await screen.findByLabelText('Tên nhóm quyền');
        submit();

        await waitFor(() => expect(document.querySelectorAll('.ant-form-item-explain-error')).toHaveLength(2));
        expect(callsTo(apiConfig.app.createFlash)).toHaveLength(0);
        expect(callsTo(apiConfig.app.create)).toHaveLength(0);
    });

    it('falls back to app/create with no admin fields after switching the option back off', async () => {
        renderPage();
        fillBasicFields();
        toggleFlash();
        fireEvent.change(await screen.findByLabelText('Tên nhóm quyền'), { target: { value: 'Group 1' } });
        toggleFlash();
        await waitFor(() => expect(screen.queryByLabelText('Tên nhóm quyền')).toBeNull());
        submit();

        await waitFor(() => expect(callsTo(apiConfig.app.create)).toHaveLength(1));
        const { data } = callsTo(apiConfig.app.create)[0][1];
        expect(data).not.toHaveProperty('permissionGroups');
        expect(data).not.toHaveProperty('accountId');
    });
});
