import { client, ClientConfig } from 'services/client';
import { getEncryptionSettings } from 'utils/env-utils';

export const getEncryptedConfig = (config: ClientConfig<any>) => {
    const { encryptionEndpoint } = getEncryptionSettings();
    return client(encryptionEndpoint, config);
};
