export const ERROR_MESSAGES = {
    unauthorized: '[Network] Unauthorized',
};

export const tokenHasIssues_GQL = (errorMessage?: string) => {
    return errorMessage && errorMessage === ERROR_MESSAGES.unauthorized;
};
