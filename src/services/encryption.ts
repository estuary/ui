import { client, ClientConfig } from 'services/client';
import { getEncryptionSettings } from 'utils/env-utils';

export const getEncryptedConfig = async (config: ClientConfig<any>) => {
    const { encryptionEndpoint } = getEncryptionSettings();

    const response = await client(encryptionEndpoint, config);

    return response;
};
