import { useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import {
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
} from '@mui/material';

import { findIndex } from 'lodash';
import { useIntl } from 'react-intl';

import { DataGridRowSkeleton } from 'src/components/collection/CollectionSkeletons';
import { formatDate } from 'src/components/shared/Entity/Details/History/shared';
import Error from 'src/components/shared/Error';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { usePublicationSpecsExt_History } from 'src/hooks/usePublicationSpecsExt';
import { BASE_ERROR } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

function PublicationList() {
    const intl = useIntl();

    const [_query, setQuery] = useQueryParams();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const originalPubId = useGlobalSearchParams(GlobalSearchParams.PUB_ID);

    const { publications, isValidating, error } =
        usePublicationSpecsExt_History(catalogName);

    const [selectedPublication, setSelectedPublication] = useState<string>(
        originalPubId ?? ''
    );

    // Default with the last on load if needed
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

    useEffect(() => {
        if (publications) {
            const currIndex = findIndex(publications, {
                pub_id: selectedPublication,
            });

            if (currIndex > -1) {
                // last_pub_id is the same as currValue when looking at the most recent publication
                // so we need to look at the previous one
                setQuery({
                    [GlobalSearchParams.PUB_ID]: selectedPublication,
                    [GlobalSearchParams.LAST_PUB_ID]:
                        publications[currIndex + 1]?.pub_id,
                });
                return;
            }
        }

        setQuery({
            [GlobalSearchParams.PUB_ID]: null,
            [GlobalSearchParams.LAST_PUB_ID]: null,
        });
    }, [publications, selectedPublication, setQuery]);

    return (
        <>
            <Typography variant="subtitle1" sx={{ p: 1 }}>
                {intl.formatMessage({ id: 'details.history.title' })}
            </Typography>

            {isValidating ? (
                <List>
                    <DataGridRowSkeleton opacity={0.75} showBorder />

                    <DataGridRowSkeleton opacity={0.5} showBorder />

                    <DataGridRowSkeleton opacity={0.25} showBorder />
                </List>
            ) : error || !hasLength(publications) ? (
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
            ) : (
                <List>
                    {publications?.map((publication) => (
                        <ListItemButton
                            component="li"
                            key={`history-timeline-${publication.pub_id}`}
                            onClick={() =>
                                setSelectedPublication(publication.pub_id)
                            }
                            selected={
                                selectedPublication === publication.pub_id
                            }
                        >
                            <ListItemText>
                                <Stack component="span">
                                    <Typography component="span">
                                        {formatDate(publication.published_at)}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        variant="caption"
                                    >
                                        {publication.detail}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        variant="caption"
                                    >
                                        {publication.user_email}
                                    </Typography>
                                </Stack>
                            </ListItemText>
                        </ListItemButton>
                    ))}
                </List>
            )}
        </>
    );
}

export default PublicationList;
