import { ToggleButton, Tooltip } from '@mui/material';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
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

    console.log('toggle', { disabled });

    return (
        <Tooltip title="Enable/Disable Binding">
            <ToggleButton
                disabled={disableButton}
                selected={!disabled}
                size="small"
                sx={{
                    border: 0,
                    p: 0,
                }}
                value="check"
                onChange={(event) => {
                    console.log('change', event);
                    event.stopPropagation();
                    toggleDisable(collection);
                }}
            >
                {!disabled ? <CheckSquare /> : <Square />}
            </ToggleButton>
        </Tooltip>
    );
}

export default BindingsSelectorToggle;
