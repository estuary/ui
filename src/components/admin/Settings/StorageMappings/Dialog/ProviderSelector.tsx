import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { CloudProviderCodes } from 'src/components/admin/Settings/StorageMappings/Dialog/cloudProviders';
import { useStorageMappingStore } from 'src/components/admin/Settings/StorageMappings/Store/create';
import { hasLength } from 'src/utils/misc-utils';

const INPUT_ID = 'cloud-provider-input';

function ProviderSelector() {
    const intl = useIntl();

    const provider = useStorageMappingStore((state) => state.provider);
    const updateProvider = useStorageMappingStore(
        (state) => state.updateProvider
    );
    const setServerError = useStorageMappingStore(
        (state) => state.setServerError
    );

    return (
        <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id={INPUT_ID}>
                <FormattedMessage id="storageMappings.provider.label" />
            </InputLabel>

            <Select
                label={intl.formatMessage({
                    id: 'storageMappings.provider.label',
                })}
                labelId={INPUT_ID}
                error={!hasLength(provider)}
                onChange={(event) => {
                    updateProvider(event.target.value as CloudProviderCodes);
                    setServerError(null);
                }}
                required
                size="small"
                value={provider ?? ''}
                sx={{ borderRadius: 3 }}
            >
                {Object.keys(CloudProviderCodes).map((code) => (
                    <MenuItem key={code} value={code}>
                        <FormattedMessage
                            id={`storageMappings.dialog.generate.providerOption.${code}`}
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default ProviderSelector;
