import { Box, Button } from '@mui/material';
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
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
            }}
        >
            <Button
                disabled={disabled}
                size="small"
                variant="text"
                sx={{
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
        </Box>
    );
}

export default CollectionSelectorHeaderToggle;
