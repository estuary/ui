import type { ReactNode } from 'react';

import { Box, Stack } from '@mui/material';

import TechnicalEmphasis from 'src/components/derivation/Create/TechnicalEmphasis';
import { TemplateOutput } from 'src/components/materialization/targetNaming/ExampleRow/TemplateOutput';

interface Props {
    label: string;
    value: string | ReactNode;
    source: string | undefined;
}

export function ExampleField({ label, value, source }: Props) {
    return (
        <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0 }}
        >
            <Box sx={{ whiteSpace: 'nowrap' }}>{label}</Box>
            <TechnicalEmphasis enableBackground>
                <TemplateOutput value={value} source={source} />
            </TechnicalEmphasis>
        </Stack>
    );
}
