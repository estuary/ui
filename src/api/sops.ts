import { getEncryptedConfig } from 'services/encryption';

interface EncryptConfig {
    data: any;
    error?: any;
}

export const encryptConfig = (
    schema: any,
    config: any
): Promise<EncryptConfig> => {
    return new Promise((resolve) => {
        getEncryptedConfig({
            data: {
                schema,
                config,
            },
        }).then(
            (response) => {
                resolve({ data: response });
            },
            (error) => {
                resolve({
                    data: null,
                    error,
                });
            }
        );
    });
};
