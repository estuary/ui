import type { OptionExampleProps } from 'src/components/materialization/source/targetSchema/types';

import { Stack, Typography, useTheme } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

function OptionExample({ example, baseTableMessageId }: OptionExampleProps) {
    const intl = useIntl();
    const theme = useTheme();

    return (
        <Stack
            component="span"
            direction="row"
            spacing={1}
            sx={{
                pl: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center',
                fontSize: 12,
            }}
        >
            <code>{intl.formatMessage({ id: baseTableMessageId })}</code>
            <ArrowRight
                style={{
                    color: theme.palette.primary.main,
                    fontSize: 9,
                }}
            />
            <Stack
                component="span"
                direction="row"
                spacing={1}
                sx={{
                    alignItems: 'center',
                }}
            >
                <Typography
                    component="span"
                    sx={{ fontWeight: 500, fontSize: 12 }}
                >
                    {intl.formatMessage({ id: 'schemaMode.data.table' })}
                </Typography>
                <code>{example.table}</code>
                <Typography component="span">|</Typography>
                <Typography
                    component="span"
                    sx={{ fontWeight: 500, fontSize: 12 }}
                >
                    {intl.formatMessage({ id: 'schemaMode.data.schema' })}
                </Typography>
                <code>{example.schema}</code>
            </Stack>
        </Stack>
    );
}

export default OptionExample;
