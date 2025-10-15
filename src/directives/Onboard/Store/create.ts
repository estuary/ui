import type { OnboardingState } from 'src/directives/Onboard/Store/types';
import type { OnboardingStoreNames } from 'src/stores/names';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';
import { PREFIX_NAME_PATTERN } from 'src/validation';

const namePattern = new RegExp(`^${PREFIX_NAME_PATTERN}$`);

const getInitialStateData = (): Pick<
    OnboardingState,
    | 'nameInvalid'
    | 'nameProblematic'
    | 'nameMissing'
    | 'requestedTenant'
    | 'surveyOptionOther'
    | 'surveyResponse'
    | 'surveyMissing'
> => ({
    nameInvalid: false,
    nameProblematic: false,
    nameMissing: false,
    requestedTenant: '',
    surveyOptionOther: 'Other',
    surveyResponse: { origin: '', details: '' },
    surveyMissing: false,
});

const getInitialState = (
    set: NamedSet<OnboardingState>,
    _get: StoreApi<OnboardingState>['getState']
): OnboardingState => ({
    ...getInitialStateData(),

    setRequestedTenant: (value) => {
        set(
            produce((state: OnboardingState) => {
                const formattedValue = value.replaceAll(/\s/g, '_');

                state.nameMissing = !hasLength(formattedValue);
                state.nameInvalid = !namePattern.test(formattedValue);
                state.nameProblematic = formattedValue.includes('test');
                state.requestedTenant = formattedValue;
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

    setNameProblematic: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.nameProblematic = value;
            }),
            false,
            'Problematic Organization Name Flag Set'
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

    setSurveyMissing: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.surveyMissing = value;
            }),
            false,
            'Survey Missing Set'
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
