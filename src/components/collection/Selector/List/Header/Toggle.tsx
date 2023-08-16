import { Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    onClick: (event: any) => void;
    disabled?: boolean;
}

function CollectionSelectorHeaderToggle({ disabled, onClick }: Props) {
    const intl = useIntl();
    const [enabled, setEnabled] = useState(false);

    return (
        <FormControlLabel
            control={
                <Switch
                    disabled={disabled}
                    size="small"
                    checked={!enabled}
                    onChange={(event) => {
                        event.stopPropagation();
                        console.log('check box clicked on', { event });
                        setEnabled(!enabled);
                        onClick(event);
                    }}
                />
            }
            label={intl.formatMessage({
                id: disabled
                    ? 'workflows.collectionSelector.toggle.enable'
                    : 'workflows.collectionSelector.toggle.disable',
            })}
            labelPlacement="bottom"
        />
    );
}

export default CollectionSelectorHeaderToggle;
