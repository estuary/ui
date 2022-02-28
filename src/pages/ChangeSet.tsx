import { Box, Button, Toolbar, Typography } from '@mui/material';
import PageContainer from 'components/shared/PageContainer';
import { FormattedMessage } from 'react-intl';
import ChangeSetTable from '../tables/ChangeSet';

const ChangeSet = () => {
    return (
        <PageContainer>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography>
                    <FormattedMessage id="changeSet.header" />
                </Typography>

                <Box>
                    <Button
                        /* TODO: Differentiate bkg color of delete button */
                        variant="contained"
                        disabled={true}
                    >
                        Delete
                    </Button>

                    <Button sx={{ ml: 2 }} variant="contained" disabled={true}>
                        Build
                    </Button>
                </Box>
            </Toolbar>

            <Box>
                <ChangeSetTable />
            </Box>
        </PageContainer>
    );
};

export default ChangeSet;
