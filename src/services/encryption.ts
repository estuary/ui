import { client, ClientConfig } from 'services/client';
import { getEncryptionSettings } from 'utils/env-utils';
import { Config } from '../../flow_deps/flow';

// TODO: Confirm whether the Config type is supposed to be a dictionary. If so, what data should be used as the key?
// If not, then flow.d.ts needs to be updated accordingly.
export const getEncryptedConfig = (
    config: ClientConfig<any>
): Promise<Config> => {
    const { encryptionEndpoint } = getEncryptionSettings();
    return client(encryptionEndpoint, config);
};
