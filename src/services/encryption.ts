import { client, ClientConfig } from 'src/services/client';
import { getEncryptionSettings } from 'src/utils/env-utils';

export const getEncryptedConfig = (config: ClientConfig<any>) => {
    const { encryptionEndpoint } = getEncryptionSettings();
    return client(encryptionEndpoint, config);
};
