export interface SurveyResponse {
    origin: string;
    details: string;
}

export interface OnboardingState {
    requestedTenant: string;
    setRequestedTenant: (value: string) => void;

    // Organization Name Validation
    nameInvalid: boolean;
    setNameInvalid: (value: boolean) => void;

    nameProblematic: boolean;
    setNameProblematic: (value: boolean) => void;

    nameMissing: boolean;
    setNameMissing: (value: boolean) => void;

    surveyMissing: boolean;
    setSurveyMissing: (value: boolean) => void;

    // Survey
    surveyOptionOther: string;

    surveyResponse: SurveyResponse;
    setSurveyResponse: (value: SurveyResponse) => void;

    // Misc.
    resetState: () => void;
}
