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
    Typography,
    useTheme,
} from '@mui/material';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import UnderDev from 'src/components/shared/UnderDev';
import {
    editorToolBarSx,
    monacoEditorComponentBackground,
} from 'src/context/Theme';
import { format } from 'date-fns';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import usePublicationSpecsExt_History from 'src/hooks/usePublicationSpecsExt';
import { findIndex } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { stringifyJSON } from 'src/services/stringify';
import { getEditorTotalHeight } from 'src/utils/editor-utils';
import { hasLength } from 'src/utils/misc-utils';
import Error from 'src/components/shared/Error';
import { BASE_ERROR } from 'src/services/supabase';
import { useIntl } from 'react-intl';

const HEIGHT = 400;
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
    const intl = useIntl();
    const theme = useTheme();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating, error } =
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

    if (isValidating) {
        return <CircularProgress />;
    }

    if (error || !hasLength(publications)) {
        return (
            <Error
                condensed
                error={
                    error ?? {
                        ...BASE_ERROR,
                        message: intl.formatMessage({
                            id: 'details.history.noPublications',
                        }),
                    }
                }
            />
        );
    }

    return (
        <Box>
            <UnderDev />
            <ListAndDetails
                displayBorder
                height={getEditorTotalHeight(HEIGHT)}
                list={
                    <>
                        <Typography variant="subtitle1" sx={{ p: 1 }}>
                            Publication History
                        </Typography>
                        <List>
                            {publications?.map((publication) => (
                                <ListItemButton
                                    key={`history-timeline-${publication.pub_id}`}
                                    onClick={() =>
                                        setSelectedPublication(
                                            publication.pub_id
                                        )
                                    }
                                    selected={
                                        selectedPublication ===
                                        publication.pub_id
                                    }
                                >
                                    <ListItemText>
                                        <Stack>
                                            <Box>
                                                {formatDate(
                                                    publication.published_at
                                                )}
                                            </Box>
                                            <Box>{publication.detail}</Box>
                                            <Box>{publication.user_email}</Box>
                                        </Stack>
                                    </ListItemText>
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                }
                details={
                    // eslint-disable-next-line react/jsx-no-useless-fragment
                    <>
                        {hasLength(publications) && currentSpec ? (
                            <>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <Box
                                            sx={{
                                                ...editorToolBarSx,
                                            }}
                                        >
                                            <Typography
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {previousSpec
                                                    ? formatDate(
                                                          previousSpec.published_at
                                                      )
                                                    : ''}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={editorToolBarSx}>
                                            <Typography
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {formatDate(
                                                    currentSpec.published_at
                                                )}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <DiffEditor
                                    height={`${HEIGHT}px`}
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
                            </>
                        ) : (
                            <CircularProgress />
                        )}
                    </>
                }
            />
        </Box>
    );
}

export default History;
