import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useStorageMappingStore } from 'components/admin/Settings/StorageMappings/Store/create';
import { FormattedMessage, useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

const INPUT_ID = 'cloud-provider-input';

export enum CloudProviderCodes {
    AZURE = 'AZURE',
    GCS = 'GCS',
    S3 = 'S3',
    CUSTOM = 'CUSTOM',
}

function ProviderSelector() {
    const intl = useIntl();

    const provider = useStorageMappingStore((state) => state.provider);
    const updateProvider = useStorageMappingStore(
        (state) => state.updateProvider
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
                    updateProvider(event.target.value);
                }}
                required
                size="small"
                value={provider}
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
