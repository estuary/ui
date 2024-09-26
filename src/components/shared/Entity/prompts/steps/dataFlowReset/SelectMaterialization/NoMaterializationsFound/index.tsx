import { Box, Button, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import AlertBox from 'components/shared/AlertBox';
import ManualSelection from '../ManualSelection';

function NoMaterializationsFound() {
    const intl = useIntl();

    return (
        <Stack spacing={2}>
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'resetDataFlow.materializations.empty.header',
                })}
            >
                <Stack spacing={2}>
                    <Typography>
                        {intl.formatMessage({
                            id: 'resetDataFlow.materializations.empty.message',
                        })}
                    </Typography>
                </Stack>
            </AlertBox>
            <Box>
                <Typography>
                    You can either manually select a materialization you want to
                    have updated or skip this step.
                </Typography>
                <Typography>
                    If you skip this step we will only publish your changes to
                    the Capture itself and not do a full data flow backfill.
                </Typography>
                <Stack direction="row" spacing={2}>
                    <ManualSelection />
                    <Button>Skip</Button>
                </Stack>
            </Box>
        </Stack>
    );
}

export default NoMaterializationsFound;
