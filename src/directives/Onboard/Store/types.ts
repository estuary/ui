export interface SurveyResponse {
    origin: string;
    details: string;
}

export interface OnboardingState {
    requestedTenant: string;
    setRequestedTenant: (value: string) => void;

    nameInvalid: boolean;
    setNameInvalid: (value: boolean) => void;

    // Only used for checking if `test` is in the name as of Q4 2025
    nameProblematic: boolean;
    setNameProblematic: (value: boolean) => void;

    nameMissing: boolean;
    setNameMissing: (value: boolean) => void;

    surveyMissing: boolean;
    setSurveyMissing: (value: boolean) => void;

    surveyResponse: SurveyResponse;
    setSurveyResponse: (value: SurveyResponse) => void;

    serverError: string | null;
    setServerError: (value: string | null) => void;

    resetState: () => void;
}
