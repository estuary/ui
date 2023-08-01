import { DiffEditor } from '@monaco-editor/react';
import {
    Box,
    CircularProgress,
    Grid,
    List,
    ListItem,
    useTheme,
} from '@mui/material';
import { PublicationSpecsExt_PublicationHistory } from 'api/publicationSpecsExt';
import KeyValueList from 'components/shared/KeyValueList';
import Tile from 'components/shared/Tile';
import { monacoEditorComponentBackground } from 'context/Theme';
import { addDays, endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'hooks/usePublicationSpecsExt';
import { findIndex } from 'lodash';
import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { stringifyJSON } from 'services/stringify';

const CARD_DATE_FORMAT = `EEEE, MMM do, yyyy 'at' hh:mm:ss aa`;
const CALENDAR_DATE_FORMAT = 'yyyy-MM-dd';

const convertData = (
    publications: PublicationSpecsExt_PublicationHistory[]
) => {
    const response: { [key: string]: number } = {}; // ScatterDataItemOption

    publications.forEach((publication) => {
        const formattedPublishDate = format(
            new Date(publication.published_at),
            CALENDAR_DATE_FORMAT
        );

        response[formattedPublishDate] = !response[formattedPublishDate]
            ? 1
            : response[formattedPublishDate] + 1;
    });

    return Object.entries(response);
};

function History() {
    const theme = useTheme();
    const intl = useIntl();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } =
        usePublicationSpecsExt_History(catalogName);

    const [selectedPublication, setSelectedPublication] = useState<string>('');

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

    const [currentSpec, previousSpec] = useMemo(() => {
        if (publications) {
            const currIndex = findIndex(publications, {
                pub_id: selectedPublication,
            });

            if (currIndex > -1) {
                const currValue = stringifyJSON(publications[currIndex].spec);
                const prevValue = publications[currIndex + 1]
                    ? stringifyJSON(publications[currIndex + 1].spec)
                    : '';
                return [currValue, prevValue];
            }
        }

        return ['', ''];
    }, [publications, selectedPublication]);

    if (isValidating || !publications || !convertedData) {
        return <CircularProgress />;
    }

    console.log('history', {
        publications,
        convertedData,
    });

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <List>
                        {publications.map((publication) => (
                            <ListItem
                                key={`history-timeline-${publication.pub_id}`}
                                onClick={() =>
                                    setSelectedPublication(publication.pub_id)
                                }
                                selected={
                                    selectedPublication === publication.pub_id
                                }
                            >
                                <Tile>
                                    <KeyValueList
                                        data={[
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
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6}>
                            Old
                        </Grid>
                        <Grid item xs={6}>
                            New
                        </Grid>
                    </Grid>
                    <DiffEditor
                        height="400px"
                        original={previousSpec}
                        modified={currentSpec}
                        theme={
                            monacoEditorComponentBackground[theme.palette.mode]
                        }
                        options={{ readOnly: true }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default History;
