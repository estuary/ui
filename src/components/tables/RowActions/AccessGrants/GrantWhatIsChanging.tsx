import type { GrantWhatIsChangingProps } from 'src/components/tables/RowActions/AccessGrants/types';

import { Stack } from '@mui/material';

function GrantWhatIsChanging({
    identifier,
    capability,
    grantScope,
}: GrantWhatIsChangingProps) {
    return (
        <Stack
            useFlexGap
            direction="row"
            spacing={0.5}
            sx={{
                'flexWrap': 'wrap',
                'lineBreak': 'anywhere',
                '& span:nth-of-type(odd)': {
                    fontWeight: 500,
                },
            }}
        >
            <span>{identifier}</span>
            <span>removing</span>
            <span>{capability}</span>
            <span>access for</span>
            <span>{grantScope}</span>
        </Stack>
    );
}

export default GrantWhatIsChanging;
