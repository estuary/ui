import { Grid, Stack, Typography } from '@mui/material';
import LiveSpecEditor from 'components/editor/LiveSpec';
import ExternalLink from 'components/shared/ExternalLink';
import { useEntityType } from 'context/EntityContext';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

function Spec() {
    const entityType = useEntityType();

    const docsLink = useMemo(() => {
        switch (entityType) {
            case 'capture':
                return 'https://docs.estuary.dev/concepts/captures/#specification';
            case 'materialization':
                return 'https://docs.estuary.dev/concepts/materialization/#specification';
            default:
                return 'https://docs.estuary.dev/concepts/collections/#specification';
        }
    }, [entityType]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Stack spacing={2} sx={{ m: 2 }}>
                    <Stack direction="row" spacing={1}>
                        <Typography
                            component="span"
                            variant="h6"
                            sx={{
                                alignItems: 'center',
                            }}
                        >
                            <FormattedMessage id="detailsPanel.specification.header" />
                        </Typography>
                        <ExternalLink link={docsLink}>
                            <FormattedMessage id="terms.documentation" />
                        </ExternalLink>
                    </Stack>
                    <LiveSpecEditor localZustandScope singleSpec />
                </Stack>
            </Grid>
        </Grid>
    );
}

export default Spec;
