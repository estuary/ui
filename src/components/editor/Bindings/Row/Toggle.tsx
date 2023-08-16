import { ToggleButton, Tooltip } from '@mui/material';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { useResourceConfig_toggleDisable } from 'stores/ResourceConfig/hooks';

interface Props {
    collection: string;
    disabled: boolean;
    selected: boolean | undefined;
}

function BindingsSelectorToggle({ collection, selected, disabled }: Props) {
    const toggleDisable = useResourceConfig_toggleDisable();

    return (
        <Tooltip title="Enable/Disable Binding">
            <ToggleButton
                disabled={disabled}
                selected={!selected}
                size="small"
                sx={{
                    border: 0,
                    p: 0,
                }}
                value="check"
                onChange={(event) => {
                    event.stopPropagation();
                    console.log('check box clicked on', { event });
                    toggleDisable(collection);
                }}
            >
                {!selected ? <CheckSquare /> : <Square />}
            </ToggleButton>
        </Tooltip>
    );
}

export default BindingsSelectorToggle;
