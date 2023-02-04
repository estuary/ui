import { Box, CircularProgress, Grid, List, ListItem } from '@mui/material';
import KeyValueList from 'components/shared/KeyValueList';
import Tile from 'components/shared/Tile';
import { format } from 'date-fns';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'hooks/usePublicationSpecsExt';
import { useIntl } from 'react-intl';

const DATE_FORMAT = 'EEEE, MMM do, yyyy';

function History() {
    const intl = useIntl();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } =
        usePublicationSpecsExt_History(catalogName);

    if (isValidating || !publications) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <List>
                        {publications.map((publication) => (
                            <ListItem
                                key={`history-timeline-${publication.pub_id}`}
                            >
                                <Tile>
                                    <KeyValueList
                                        data={[
                                            {
                                                title: intl.formatMessage({
                                                    id: 'data.email',
                                                }),
                                                val: publication.user_email,
                                            },
                                            {
                                                title: intl.formatMessage({
                                                    id: 'data.published_at',
                                                }),
                                                val: format(
                                                    new Date(
                                                        publication.published_at
                                                    ),
                                                    DATE_FORMAT
                                                ),
                                            },
                                        ]}
                                    />
                                </Tile>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </Grid>
        </Box>
    );
}

export default History;
