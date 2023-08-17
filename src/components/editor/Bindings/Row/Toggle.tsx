import { FormControlLabel, Switch } from '@mui/material';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useResourceConfig_resourceConfigOfCollection,
    useResourceConfig_toggleDisable,
} from 'stores/ResourceConfig/hooks';

interface Props {
    collection: string;
    disableButton: boolean;
}

function BindingsSelectorToggle({ collection, disableButton }: Props) {
    const intl = useIntl();
    const toggleDisable = useResourceConfig_toggleDisable();
    const resourceConfig =
        useResourceConfig_resourceConfigOfCollection(collection);

    const disabled = useMemo<boolean | undefined>(() => {
        console.log('resourceConfig disabled memo', resourceConfig);
        return resourceConfig.disable;
    }, [resourceConfig]);

    return (
        <FormControlLabel
            control={
                <Switch
                    disabled={disableButton}
                    size="small"
                    checked={!disabled}
                    onChange={(event) => {
                        console.log('change', event);
                        event.stopPropagation();
                        toggleDisable(collection);
                    }}
                />
            }
            label={intl.formatMessage({
                id: disabled ? 'common.disabled' : 'common.enabled',
            })}
            labelPlacement="bottom"
            sx={{
                '& .MuiFormControlLabel-label': {
                    height: 0,
                    visibility: 'collapse',
                },
            }}
        />
    );
}

export default BindingsSelectorToggle;
