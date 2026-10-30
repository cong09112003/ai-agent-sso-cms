import { createReducer } from '@store/utils';
import { appActions } from '@store/actions';
import { defaultLocale, THEMES } from '@constants';
import { setUserKindData } from '@store/actions/app';

const {
    hideAppLoading,
    showAppLoading,
    toggleActionLoading,
    changeLanguage,
    changeTheme,
} = appActions;

const initialState = {
    appLoading: 0,
    locale: defaultLocale,
    theme: THEMES.LIGHT,
    userKindData: [],
};

const appReducer = createReducer(
    {
        reducerName: 'app',
        initialState,
        storage: {
            whiteList: ['theme', 'locale'],
        },
    },
    {
        [showAppLoading.type]: (state) => {
            state.appLoading++;
        },
        [hideAppLoading.type]: (state) => {
            state.appLoading = Math.max(0, state.appLoading - 1);
        },
        [toggleActionLoading.type]: (state, action) => {
            if (action.payload.isLoading) {
                state[action.payload.type] = true;
            } else {
                delete state[action.payload.type];
            }
        },
        [changeLanguage.type]: (state, { payload }) => {
            state.locale = payload;
        },
        [changeTheme.type]: (state, { payload }) => {
            state.theme = payload;
        },
        [setUserKindData.type]: (state, { payload }) => {
            state.userKindData = payload;
        },
    },
);

export default appReducer;
