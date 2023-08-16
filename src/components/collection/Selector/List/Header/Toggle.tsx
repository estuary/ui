import { Tooltip, ToggleButton } from '@mui/material';
import { Square } from 'iconoir-react';
import CheckSquare from 'icons/CheckSquare';
import { useState } from 'react';

interface Props {
    onClick: (event: any) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderToggle({ disabled, onClick }: Props) {
    const [enabled, setEnabled] = useState(false);

    return (
        <Tooltip title="Enable/Disable All Bindings">
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
                    onClick(event);
                }}
            >
                {enabled ? <CheckSquare /> : <Square />}
            </ToggleButton>
        </Tooltip>
    );
}

export default CollectionSelectorHeaderToggle;
