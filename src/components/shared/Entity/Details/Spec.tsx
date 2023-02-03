import { Grid, Stack, Typography } from '@mui/material';
import MonacoEditor from 'components/editor/MonacoEditor';
import { FormattedMessage } from 'react-intl';

function Spec() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack direction="column" spacing={2} sx={{ m: 2 }}>
                    <Typography
                        component="span"
                        variant="h6"
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <FormattedMessage id="detailsPanel.specification.header" />
                    </Typography>
                    <MonacoEditor localZustandScope={true} height={500} />
                </Stack>
            </Grid>
        </Grid>
    );
}

export default Spec;
