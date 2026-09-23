import type { OnboardingState } from 'src/directives/Onboard/Store/types';

import { useLocalZustandStore } from 'src/context/LocalZustand';
import { OnboardingStoreNames } from 'src/stores/names';

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

export const useOnboardingStore_nameProblematic = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['nameProblematic']
    >(OnboardingStoreNames.GENERAL, (state) => state.nameProblematic);
};

export const useOnboardingStore_setNameMissing = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setNameMissing']
    >(OnboardingStoreNames.GENERAL, (state) => state.setNameMissing);
};

export const useOnboardingStore_surveyMissing = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['surveyMissing']
    >(OnboardingStoreNames.GENERAL, (state) => state.surveyMissing);
};

export const useOnboardingStore_setSurveyMissing = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setSurveyMissing']
    >(OnboardingStoreNames.GENERAL, (state) => state.setSurveyMissing);
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

export const useOnboardingStore_serverError = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['serverError']
    >(OnboardingStoreNames.GENERAL, (state) => state.serverError);
};

export const useOnboardingStore_setServerError = () => {
    return useLocalZustandStore<
        OnboardingState,
        OnboardingState['setServerError']
    >(OnboardingStoreNames.GENERAL, (state) => state.setServerError);
};
