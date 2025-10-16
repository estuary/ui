import type { OnboardingState } from 'src/directives/Onboard/Store/types';
import type { OnboardingStoreNames } from 'src/stores/names';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
    | 'surveyResponse'
    | 'surveyMissing'
    | 'serverError'
> => ({
    nameInvalid: false,
    nameProblematic: false,
    nameMissing: false,
    requestedTenant: '',
    surveyResponse: { origin: '', details: '' },
    surveyMissing: false,
    serverError: null,
});

const getInitialState = (set: NamedSet<OnboardingState>): OnboardingState => ({
    ...getInitialStateData(),

    setRequestedTenant: (value) => {
        set(
            (state) => {
                const formattedValue = value.replaceAll(/\s/g, '_');

                return {
                    ...state,
                    nameMissing: !hasLength(formattedValue),
                    nameInvalid: !namePattern.test(formattedValue),
                    nameProblematic: formattedValue.includes('test'),
                    requestedTenant: formattedValue,
                };
            },
            false,
            'Requested Tenant Set'
        );
    },

    setNameInvalid: (value) => {
        set(
            () => ({
                nameInvalid: value,
            }),
            false,
            'setNameInvalid'
        );
    },

    setServerError: (value) => {
        set(
            (state) => ({
                serverError: value,
            }),
            false,
            'setServerError'
        );
    },

    setNameMissing: (value) => {
        set(
            (state) => ({
                nameMissing: value,
            }),
            false,
            'setNameMissing'
        );
    },

    setNameProblematic: (value) => {
        set(
            (state) => ({
                nameProblematic: value,
            }),
            false,
            'setNameProblematic'
        );
    },
    setSurveyResponse: (value) => {
        set(
            (state) => ({
                surveyResponse: value,
            }),
            false,
            'setSurveyResponse'
        );
    },
    setSurveyMissing: (value) => {
        set(
            (state) => ({
                surveyMissing: value,
            }),
            false,
            'setSurveyMissing'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Onboarding State Reset');
    },
});

export const createOnboardingStore = (key: OnboardingStoreNames) =>
    create<OnboardingState>()(
        devtools((set) => getInitialState(set), devtoolsOptions(key))
    );
