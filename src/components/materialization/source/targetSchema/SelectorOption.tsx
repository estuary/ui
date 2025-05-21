import type { AutoCompleteOptionForTargetSchema } from 'src/components/materialization/source/targetSchema/types';
import type { SelectorOptionProps } from 'src/components/shared/specPropEditor/types';

import { Stack, Typography } from '@mui/material';

function SelectorOption({
    option,
}: SelectorOptionProps<AutoCompleteOptionForTargetSchema>) {
    const { description, label } = option;

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

            {/*TODO (source capture examples) - component would go here*/}
        </Stack>
    );
}

export default SelectorOption;
