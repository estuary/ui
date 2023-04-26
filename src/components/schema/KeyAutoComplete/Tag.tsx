import { Chip, Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';

interface Props {
    tagProps: any;
    value: string;
    validOption: boolean;
}

function Tag({ tagProps, value, validOption }: Props) {
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
                label={value}
                sx={{
                    bgcolor: (theme) =>
                        validOption ? undefined : theme.palette.error.main,
                }}
            />
        </Tooltip>
    );
}

export default Tag;
