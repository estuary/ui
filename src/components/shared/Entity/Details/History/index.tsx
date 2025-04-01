/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useEffect, useMemo, useState } from 'react';

import {
    Box,
    CircularProgress,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';

import { findIndex } from 'lodash';
import { useIntl } from 'react-intl';

import ListAndDetails from 'src/components/editor/ListAndDetails';
import DiffViewer from 'src/components/shared/Entity/Details/History/DiffViewer';
import {
    formatDate,
    HEIGHT,
} from 'src/components/shared/Entity/Details/History/shared';
import Error from 'src/components/shared/Error';
import UnderDev from 'src/components/shared/UnderDev';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { usePublicationSpecsExt_History } from 'src/hooks/usePublicationSpecsExt';
import { BASE_ERROR } from 'src/services/supabase';
import { getEditorTotalHeight } from 'src/utils/editor-utils';
import { hasLength } from 'src/utils/misc-utils';

function History() {
    const intl = useIntl();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating, error } =
        usePublicationSpecsExt_History(catalogName);

    const [selectedPublication, setSelectedPublication] = useState<string>('');

    const [currentPubId, previousPubId] = useMemo<
        [string | null, string | null]
    >(() => {
        if (publications) {
            const currIndex = findIndex(publications, {
                pub_id: selectedPublication,
            });

            if (currIndex > -1) {
                // last_pub_id is the same as currValue when looking at the most recent publication
                // so we need to look at the previous one
                return [
                    selectedPublication,
                    publications[currIndex + 1]?.pub_id,
                ];
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
                    <DiffViewer
                        originalPubId={previousPubId}
                        modifiedPubId={currentPubId}
                    />
                }
            />
        </Box>
    );
}

export default History;
