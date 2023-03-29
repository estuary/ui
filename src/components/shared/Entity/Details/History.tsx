import { Box, CircularProgress, Grid, List, ListItem } from '@mui/material';
import { PublicationSpecsExt_PublicationHistory } from 'api/publicationSpecsExt';
import KeyValueList from 'components/shared/KeyValueList';
import Tile from 'components/shared/Tile';
import { addDays, endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'hooks/usePublicationSpecsExt';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

const CARD_DATE_FORMAT = 'EEEE, MMM do, yyyy';
const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd';

export const convertData = (
    publications: PublicationSpecsExt_PublicationHistory[]
) => {
    const response: { [key: string]: number } = {}; // ScatterDataItemOption

    publications.forEach((publication) => {
        const formattedPublish = format(
            new Date(publication.published_at),
            CALENDAR_DATE_FORMAT
        );

        response[formattedPublish] = !response[formattedPublish]
            ? 1
            : response[formattedPublish] + 1;
    });

    return Object.entries(response);
};

function History() {
    const intl = useIntl();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } =
        usePublicationSpecsExt_History(catalogName);

    const convertedData = useMemo(() => {
        if (publications && publications.length > 0) {
            const data = convertData(publications);

            return {
                data,
                start: startOfMonth(subDays(new Date(data[0][0]), 1)),
                end: endOfMonth(addDays(new Date(data[data.length - 1][0]), 1)),
            };
        }

        return null;
    }, [publications]);

    if (isValidating || !publications || !convertedData) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={6}>
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
                                                    CARD_DATE_FORMAT
                                                ),
                                            },
                                        ]}
                                    />
                                </Tile>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={6}>
                    {/*<ReactECharts
                        option={{
                            tooltip: {},

                            calendar: {
                                orient: 'vertical',
                                range: [convertedData.start, convertedData.end],
                                width: '50%',
                                height: '50%',
                            },
                            series: [
                                {
                                    type: 'scatter',
                                    symbolSize: 15,
                                    coordinateSystem: 'calendar',
                                    data: convertedData.data,
                                },
                            ],
                        }}
                    />*/}
                </Grid>
            </Grid>
        </Box>
    );
}

export default History;
