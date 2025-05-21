import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { SelectorOptionProps } from 'src/components/shared/specPropEditor/types';

import { Stack, Typography } from '@mui/material';

import { ArrowRight } from 'iconoir-react';
import { useIntl } from 'react-intl';

function SelectorOption({
    option,
}: SelectorOptionProps<AutoCompleteOptionForTargetSchema>) {
    const { description, label, example } = option;

    const intl = useIntl();

    return (
        <Stack component="span" spacing={1}>
            <Typography component="span" style={{ fontWeight: 500 }}>
                {label}
            </Typography>

            <Typography
                component="span"
                sx={{
                    pl: 1.5,
                }}
            >
                {description}
            </Typography>

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    pl: 1.5,
                }}
            >
                <code>
                    {intl.formatMessage({ id: 'schemaMode.example.table' })}
                </code>
                <Typography>
                    <ArrowRight />
                </Typography>
                <strong>Table:</strong>
                <code>{example.table}</code>
                <strong>Schema:</strong>
                <code>{example.schema}</code>
            </Stack>
        </Stack>
    );
}

export default SelectorOption;
