/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { DiffEditor } from '@monaco-editor/react';
import {
    Box,
    CircularProgress,
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    useTheme,
} from '@mui/material';
import { monacoEditorComponentBackground } from 'context/Theme';
import { format } from 'date-fns';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'hooks/usePublicationSpecsExt';
import { findIndex } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { stringifyJSON } from 'services/stringify';
import { hasLength } from 'utils/misc-utils';

const CARD_DATE_FORMAT = `EEEE, MMM do, yyyy 'at' hh:mm:ss aa`;

const formatDate = (date?: string) => {
    return date ? format(new Date(date), CARD_DATE_FORMAT) : 'unknown';
};

// TODO (details history) this was used to format data into something a eCharts heatmap could use
// const convertData = (
//     publications: PublicationSpecsExt_PublicationHistory[]
// ) => {
//     const response: { [key: string]: number } = {}; // ScatterDataItemOption

//     publications.forEach((publication) => {
//         const formattedPublishDate = format(
//             new Date(publication.published_at),
//             CALENDAR_DATE_FORMAT
//         );

//         response[formattedPublishDate] = !response[formattedPublishDate]
//             ? 1
//             : response[formattedPublishDate] + 1;
//     });

//     return Object.entries(response);
// };

function History() {
    const theme = useTheme();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } =
        usePublicationSpecsExt_History(catalogName);

    const [selectedPublication, setSelectedPublication] = useState<string>('');

    const [currentSpec, previousSpec] = useMemo(() => {
        if (publications) {
            const currIndex = findIndex(publications, {
                pub_id: selectedPublication,
            });

            if (currIndex > -1) {
                const currValue = publications[currIndex];
                const prevValue = publications[currIndex + 1];
                return [currValue, prevValue];
            }
        }

        return [null, null];
    }, [publications, selectedPublication]);

    useEffect(() => {
        if (
            selectedPublication === '' &&
            publications &&
            hasLength(publications)
        ) {
            const defaultCur = publications[0];
            const defaultPubId = defaultCur.pub_id;

            setSelectedPublication(defaultPubId);
        }
    }, [publications, selectedPublication]);

    if (isValidating || !publications) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                    <List>
                        {publications.map((publication) => (
                            <ListItemButton
                                key={`history-timeline-${publication.pub_id}`}
                                onClick={() =>
                                    setSelectedPublication(publication.pub_id)
                                }
                                selected={
                                    selectedPublication === publication.pub_id
                                }
                            >
                                <ListItemText>
                                    <Stack>
                                        <Box>
                                            {formatDate(
                                                publication.published_at
                                            )}
                                        </Box>
                                        <Box>{publication.user_email}</Box>
                                    </Stack>
                                </ListItemText>
                            </ListItemButton>
                        ))}
                    </List>
                </Grid>
                {hasLength(publications) && currentSpec ? (
                    <Grid item xs={12} md={9}>
                        <Grid container>
                            <Grid item xs={6}>
                                {previousSpec
                                    ? formatDate(previousSpec.published_at)
                                    : ''}
                            </Grid>
                            <Grid item xs={6}>
                                {formatDate(currentSpec.published_at)}
                            </Grid>
                        </Grid>
                        <DiffEditor
                            height="400px"
                            original={
                                previousSpec
                                    ? stringifyJSON(previousSpec.spec)
                                    : ''
                            }
                            modified={stringifyJSON(currentSpec.spec)}
                            theme={
                                monacoEditorComponentBackground[
                                    theme.palette.mode
                                ]
                            }
                            options={{ readOnly: true }}
                        />
                    </Grid>
                ) : null}
            </Grid>
        </Box>
    );
}

export default History;
