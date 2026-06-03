export interface RefreshTokenState {
    token: string;
    setToken: (value: string) => void;

    description: string;
    updateDescription: (value: string) => void;

    saving: boolean;
    setSaving: (value: boolean) => void;

    serverError: string | null;
    setServerError: (value: string | null) => void;

    resetState: () => void;
}
