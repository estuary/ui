import { Chip, Tooltip } from '@mui/material';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    tagProps: any;
    label: ReactNode;
    validOption: boolean;
}

function Tag({ tagProps, label, validOption }: Props) {
    const intl = useIntl();

    return (
        <Tooltip
            disableInteractive={validOption}
            disableFocusListener={validOption}
            disableHoverListener={validOption}
            disableTouchListener={validOption}
            title={
                !validOption
                    ? intl.formatMessage({
                          id: 'data.key.errors.invalidKey',
                      })
                    : undefined
            }
        >
            <Chip
                {...tagProps}
                onClick={() => {
                    console.log('chip was clicked');
                }}
                onDelete={() => {
                    console.log('chip was deleted');
                }}
                color={validOption ? 'default' : 'error'}
                label={label}
                sx={{
                    '& .MuiChip-deleteIcon::after': {
                        zIndex: 999999,
                        color: 'purple',
                    },
                }}
            />
        </Tooltip>
    );
}

export default Tag;
