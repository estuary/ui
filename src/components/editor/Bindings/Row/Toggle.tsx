import { Checkbox, Tooltip } from '@mui/material';

interface Props {
    disabled: boolean;
}

function BindingsSelectorToggle({ disabled }: Props) {
    return (
        <Tooltip title="Enable/Disable Binding">
            <Checkbox
                disabled={disabled}
                size="small"
                onChange={(event) => {
                    event.stopPropagation();
                    console.log('check box clicked on', { event });
                }}
            />
        </Tooltip>
    );
}

export default BindingsSelectorToggle;
