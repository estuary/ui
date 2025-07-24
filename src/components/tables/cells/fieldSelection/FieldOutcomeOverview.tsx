import type { BaseFieldOutcomeProps } from 'src/components/tables/cells/types';

import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import FieldOutput from 'src/components/tables/cells/fieldSelection/FieldOutput';
import { hasFieldConflict } from 'src/utils/fieldSelection-utils';

const FieldOutcomeOverview = ({ outcome }: BaseFieldOutcomeProps) => {
    const intl = useIntl();

    const conflictExists = hasFieldConflict(outcome);

    return (
        <Stack spacing={2}>
            {outcome?.select ? (
                <Box>
                    <Typography style={{ marginBottom: 4 }}>
                        {intl.formatMessage({
                            id: conflictExists
                                ? 'fieldSelection.outcomeButton.select.header.conflict'
                                : 'fieldSelection.outcomeButton.select.header',
                        })}
                    </Typography>

                    <Box style={{ paddingLeft: 16 }}>
                        <FieldOutput output={outcome.select} />
                    </Box>
                </Box>
            ) : null}

            {outcome?.reject ? (
                <Box>
                    <Typography style={{ marginBottom: 4 }}>
                        {intl.formatMessage({
                            id: conflictExists
                                ? 'fieldSelection.outcomeButton.reject.header.conflict'
                                : 'fieldSelection.outcomeButton.reject.header',
                        })}
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
