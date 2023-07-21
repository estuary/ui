import { useLocalZustandStore } from 'context/LocalZustand';

import { OnboardingState } from 'directives/Onboard/Store/types';

import { OnboardingStoreNames } from 'stores/names';

export const useOnboardingStore_requestedTenant = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['requestedTenant']
    >(OnboardingStoreNames.GENERAL, (state) => state.requestedTenant);
};

export const useOnboardingStore_setRequestedTenant = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setRequestedTenant']
    >(OnboardingStoreNames.GENERAL, (state) => state.setRequestedTenant);
};

export const useOnboardingStore_nameInvalid = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['nameInvalid']
    >(OnboardingStoreNames.GENERAL, (state) => state.nameInvalid);
};

export const useOnboardingStore_setNameInvalid = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setNameInvalid']
    >(OnboardingStoreNames.GENERAL, (state) => state.setNameInvalid);
};

export const useOnboardingStore_nameMissing = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['nameMissing']
    >(OnboardingStoreNames.GENERAL, (state) => state.nameMissing);
};

export const useOnboardingStore_setNameMissing = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setNameMissing']
    >(OnboardingStoreNames.GENERAL, (state) => state.setNameMissing);
};

export const useOnboardingStore_surveyOptionOther = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['surveyOptionOther']
    >(OnboardingStoreNames.GENERAL, (state) => state.surveyOptionOther);
};

export const useOnboardingStore_surveyResponse = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['surveyResponse']
    >(OnboardingStoreNames.GENERAL, (state) => state.surveyResponse);
};

export const useOnboardingStore_setSurveyResponse = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setSurveyResponse']
    >(OnboardingStoreNames.GENERAL, (state) => state.setSurveyResponse);
};

export const useOnboardingStore_resetState = () => {
    return useLocalZustandStore<OnboardingState, OnboardingState['resetState']>(
        OnboardingStoreNames.GENERAL,
        (state) => state.resetState
    );
};
