import type { BaseFieldOutcomeProps } from 'src/components/tables/cells/types';

import { Box, Stack, Typography } from '@mui/material';

import FieldOutput from 'src/components/tables/cells/fieldSelection/FieldOutput';
import { hasFieldConflict } from 'src/utils/fieldSelection-utils';

const FieldOutcomeOverview = ({ outcome }: BaseFieldOutcomeProps) => {
    const conflictExists = hasFieldConflict(outcome);

    return (
        <Stack spacing={2}>
            {outcome?.select ? (
                <Box>
                    <Typography style={{ marginBottom: 4 }}>
                        {conflictExists
                            ? 'A reason to include this field is:'
                            : 'This field will be included because:'}
                    </Typography>

                    <Box style={{ paddingLeft: 16 }}>
                        <FieldOutput output={outcome.select} />
                    </Box>
                </Box>
            ) : null}

            {outcome?.reject ? (
                <Box>
                    <Typography style={{ marginBottom: 4 }}>
                        {conflictExists
                            ? 'A reason to exclude this field is:'
                            : 'This field will be excluded because:'}
                    </Typography>

                    <Box style={{ paddingLeft: 16 }}>
                        <FieldOutput output={outcome.reject} />
                    </Box>
                </Box>
            ) : null}
        </Stack>
    );
};

export default FieldOutcomeOverview;
