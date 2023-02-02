import { Card, CardContent, Grid, Typography } from '@mui/material';
import MonacoEditor from 'components/editor/MonacoEditor';
import { FormattedMessage } from 'react-intl';

function Spec() {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle1">
                            <FormattedMessage id="detailsPanel.specification.header" />
                        </Typography>

                        <MonacoEditor localZustandScope={true} disabled />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

export default Spec;
