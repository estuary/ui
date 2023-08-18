import { Button } from '@mui/material';
import { dataGridEntireCellButtonStyling } from 'context/Theme';
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
        <Button
            disabled={disabled}
            size="small"
            variant="text"
            sx={{
                ...dataGridEntireCellButtonStyling,
                py: 0,
                px: 1,
                textTransform: 'none',
            }}
            onClick={(event) => {
                event.stopPropagation();
                setEnabled(!enabled);
                onClick(event, !enabled);
            }}
        >
            {intl.formatMessage({
                id: enabled
                    ? 'workflows.collectionSelector.toggle.enable'
                    : 'workflows.collectionSelector.toggle.disable',
            })}
        </Button>
    );
}

export default CollectionSelectorHeaderToggle;
