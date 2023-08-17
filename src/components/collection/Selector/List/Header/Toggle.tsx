import { Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    onClick: (event: any, value: boolean) => void;
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
                        setEnabled(!enabled);
                        onClick(event, !enabled);
                    }}
                />
            }
            label={intl.formatMessage({
                id: enabled
                    ? 'workflows.collectionSelector.toggle.enable'
                    : 'workflows.collectionSelector.toggle.disable',
            })}
            labelPlacement="bottom"
        />
    );
}

export default CollectionSelectorHeaderToggle;
