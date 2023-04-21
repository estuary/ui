import { OnboardingState } from 'directives/Onboard/Store/types';
import produce from 'immer';
import { OnboardingStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    OnboardingState,
    | 'nameInvalid'
    | 'nameMissing'
    | 'requestedTenant'
    | 'surveyOptionOther'
    | 'surveyResponse'
    | 'surveyResponseMissing'
> => ({
    nameInvalid: false,
    nameMissing: false,
    requestedTenant: '',
    surveyOptionOther: 'Other',
    surveyResponse: { origin: '', details: '' },
    surveyResponseMissing: false,
});

const getInitialState = (
    set: NamedSet<OnboardingState>,
    _get: StoreApi<OnboardingState>['getState']
): OnboardingState => ({
    ...getInitialStateData(),

    setRequestedTenant: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.requestedTenant = value;
            }),
            false,
            'Requested Tenant Set'
        );
    },

    setNameInvalid: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.nameInvalid = value;
            }),
            false,
            'Invalid Organization Name Flag Set'
        );
    },

    setNameMissing: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.nameMissing = value;
            }),
            false,
            'Missing Organization Name Flag Set'
        );
    },

    setSurveyResponse: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.surveyResponse = value;
            }),
            false,
            'Survey Response Set'
        );
    },

    setSurveyResponseMissing: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.surveyResponseMissing = value;
            }),
            false,
            'Missing Survey Response Flag Set'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Onboarding State Reset');
    },
});

export const createOnboardingStore = (key: OnboardingStoreNames) =>
    create<OnboardingState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
