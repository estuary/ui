import { Stack, Typography, useTheme } from '@mui/material';
import { WarningCircle } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { HeaderProps } from './types';

export default function Header({ errorsExist }: HeaderProps) {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Stack direction="row" spacing={1} style={{ alignItems: 'center' }}>
            {errorsExist ? (
                <WarningCircle
                    style={{
                        fontSize: 12,
                        color: theme.palette.error.main,
                    }}
                />
            ) : null}

            <Typography variant="formSectionHeader">
                {intl.formatMessage({
                    id: 'workflows.advancedSettings.title',
                })}
            </Typography>
        </Stack>
    );
}
