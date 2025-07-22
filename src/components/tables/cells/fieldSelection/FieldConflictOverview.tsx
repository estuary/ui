import type { FieldConflictOverviewProps } from 'src/components/tables/cells/types';

import { Box, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import FieldOutput from 'src/components/tables/cells/fieldSelection/FieldOutput';

const FieldConflictOverview = ({ outcome }: FieldConflictOverviewProps) => {
    const intl = useIntl();

    return (
        <Stack spacing={2}>
            {/* <Box>
                <Typography style={{ marginBottom: 4 }} variant="h6">
                    {intl.formatMessage({
                        id: 'fieldSelection.conflict.header',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage(
                        {
                            id: 'fieldSelection.conflict.description',
                        },
                        {
                            field: (
                                <span style={{ fontWeight: 500 }}>{field}</span>
                            ),
                        }
                    )}
                </Typography>
            </Box> */}

            {outcome?.select ? (
                <Box>
                    <Typography style={{ marginBottom: 4 }}>
                        {intl.formatMessage({
                            id: 'fieldSelection.conflict.select.header',
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
                            id: 'fieldSelection.conflict.reject.header',
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

export default FieldConflictOverview;
