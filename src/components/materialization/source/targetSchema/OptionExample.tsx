import type { OptionExampleProps } from 'src/components/materialization/source/targetSchema/types';

import { Stack, Typography, useTheme } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { TARGET_SCHEMA_HIGHLIGHT_CLASS } from 'src/components/materialization/source/targetSchema/shared';

const labelStyling = { fontWeight: 500, fontSize: 12 };

function OptionExample({ example, baseTableMessageID }: OptionExampleProps) {
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
                [`& .${TARGET_SCHEMA_HIGHLIGHT_CLASS}`]: {
                    fontWeight: 700,
                    fontSize: 12.5,
                },
            }}
        >
            <code>
                {intl.formatMessage(
                    { id: baseTableMessageID },
                    {
                        tablePrefix: example.tablePrefix,
                    }
                )}
            </code>
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
                <Typography component="span" sx={labelStyling}>
                    {intl.formatMessage({ id: 'schemaMode.data.table' })}
                </Typography>
                <code>{example.table}</code>
                <Typography component="span">|</Typography>
                <Typography component="span" sx={labelStyling}>
                    {intl.formatMessage({ id: 'schemaMode.data.schema' })}
                </Typography>
                <code>{example.schema}</code>
            </Stack>
        </Stack>
    );
}

export default OptionExample;
