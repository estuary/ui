import { ToggleButton, Tooltip } from '@mui/material';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { useState } from 'react';

interface Props {
    disabled: boolean;
}

function BindingsSelectorToggle({ disabled }: Props) {
    const [enabled, setEnabled] = useState<boolean>(false);

    return (
        <Tooltip title="Enable/Disable Binding">
            <ToggleButton
                disabled={disabled}
                selected={enabled}
                size="small"
                sx={{
                    border: 0,
                    p: 0,
                }}
                value="check"
                onChange={(event) => {
                    event.stopPropagation();
                    console.log('check box clicked on', { event });
                    setEnabled(!enabled);
                }}
            >
                {enabled ? <CheckSquare /> : <Square />}
            </ToggleButton>
        </Tooltip>
    );
}

export default BindingsSelectorToggle;
