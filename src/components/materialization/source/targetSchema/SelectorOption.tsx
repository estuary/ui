import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { SelectorOptionProps } from 'src/components/shared/specPropEditor/types';

import { Stack, Typography } from '@mui/material';

import OptionExample from 'src/components/materialization/source/targetSchema/OptionExample';

function SelectorOption({
    option: { description, label, example, publicExample },
}: SelectorOptionProps<AutoCompleteOptionForTargetSchema>) {
    return (
        <Stack component="span" spacing={1} sx={{ pb: 1 }}>
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

            <OptionExample
                example={example}
                baseTableMessageID="schemaMode.example.base"
            />
            {publicExample ? (
                <OptionExample
                    example={publicExample}
                    baseTableMessageID="schemaMode.example.base"
                />
            ) : null}
        </Stack>
    );
}

export default SelectorOption;
