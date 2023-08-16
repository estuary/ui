import { FormControlLabel, Switch } from '@mui/material';
import { useIntl } from 'react-intl';
import { useResourceConfig_toggleDisable } from 'stores/ResourceConfig/hooks';

interface Props {
    collection: string;
    disabled: boolean | undefined;
    disableButton: boolean;
}

function BindingsSelectorToggle({
    collection,
    disableButton,
    disabled,
}: Props) {
    const intl = useIntl();
    const toggleDisable = useResourceConfig_toggleDisable();

    console.log('toggle', { disabled });

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
        />
    );
}

export default BindingsSelectorToggle;
