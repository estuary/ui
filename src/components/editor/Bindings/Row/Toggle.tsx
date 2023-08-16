import { FormControlLabel, Switch } from '@mui/material';
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
    const toggleDisable = useResourceConfig_toggleDisable();

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
            label={null}
        />
    );
}

export default BindingsSelectorToggle;
