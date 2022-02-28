import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
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
                    <Button component={IconButton} variant="contained">
                        <DeleteIcon /* TODO: Differentiate bkg color of delete button */
                        />
                    </Button>

                    <Button sx={{ ml: 2 }} variant="contained">
                        Build
                    </Button>
                </Box>
            </Toolbar>

            <Box
                sx={{
                    maxHeight: 250,
                    overflow: 'auto',
                }}
            >
                <ChangeSetTable />
            </Box>
        </PageContainer>
    );
};

export default ChangeSet;
