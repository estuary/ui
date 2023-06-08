import { Schema } from 'types';

export interface CustomError {
    instancePath: string;
    message: string;
    schemaPath: string;
    keyword: string;
    params: Schema;
}

export const generateCustomError = (instancePath: string, message: string) => {
    return {
        instancePath,
        message,
        schemaPath: '',
        keyword: '',
        params: {},
    };
};

export interface StoreWithCustomErrors {
    customErrors: CustomError[];
    customErrorsExist: boolean;
    setCustomErrors: (val: StoreWithCustomErrors['customErrors']) => void;
}

export const getInitialCustomErrorsData = (): Pick<
    StoreWithCustomErrors,
    'customErrors' | 'customErrorsExist'
> => ({
    customErrors: [],
    customErrorsExist: false,
});

export const getStoreWithCustomErrorsSettings = (
    key: string
): StoreWithCustomErrors => {
    return {
        ...getInitialCustomErrorsData(),

        setCustomErrors: () => {
            throw new Error(`${key} setCustomErrors not implemented`);
        },
    };
};
