import produce from 'immer';
import { create, StoreApi } from 'zustand';

import { OnboardingState } from 'directives/Onboard/Store/types';

import { OnboardingStoreNames } from 'stores/names';

import { hasLength, PREFIX_NAME_PATTERN } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';

import { devtools, NamedSet } from 'zustand/middleware';

const namePattern = new RegExp(`^${PREFIX_NAME_PATTERN}$`);

const getInitialStateData = (): Pick<
    OnboardingState,
    | 'nameInvalid'
    | 'nameMissing'
    | 'requestedTenant'
    | 'surveyOptionOther'
    | 'surveyResponse'
> => ({
    nameInvalid: false,
    nameMissing: false,
    requestedTenant: '',
    surveyOptionOther: 'Other',
    surveyResponse: { origin: '', details: '' },
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

    setSurveyResponse: (value) => {
        set(
            produce((state: OnboardingState) => {
                state.surveyResponse = value;
            }),
            false,
            'Survey Response Set'
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
