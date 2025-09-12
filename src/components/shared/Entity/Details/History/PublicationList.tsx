import { useEffect, useRef, useState } from 'react';

import {
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { findIndex } from 'lodash';
import { useIntl } from 'react-intl';

import { DataGridRowSkeleton } from 'src/components/collection/CollectionSkeletons';
import { formatDate } from 'src/components/shared/Entity/Details/History/shared';
import Error from 'src/components/shared/Error';
import { historyCompareBorder, historyCompareColors } from 'src/context/Theme';
import { useHistoryDiffQueries } from 'src/hooks/useHistoryDiffQueries';
import useScrollIntoView from 'src/hooks/useScrollIntoView';
import { BASE_ERROR } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

function PublicationList() {
    const intl = useIntl();
    const theme = useTheme();

    const {
        modifiedPubId,
        updateSelections,
        pubHistory: { publications, isValidating, error },
    } = useHistoryDiffQueries();

    const stopScrollingIntoView = useRef(false);
    const scrollToTarget = useRef<HTMLDivElement>(null);
    const scrollIntoView = useScrollIntoView(scrollToTarget);

    const [selectedPublication, setSelectedPublication] = useState<string>(
        modifiedPubId ?? ''
    );

    useEffect(() => {
        if (!stopScrollingIntoView.current && scrollToTarget.current) {
            scrollIntoView(scrollToTarget, {
                behavior: 'auto',
            });
            stopScrollingIntoView.current = true;
        }
    });

    useEffect(() => {
        if (
            selectedPublication === '' &&
            publications &&
            publications.length > 0
        ) {
            // If there is nothing in the URL then go ahead and
            //  default to the newest publication we got back
            setSelectedPublication(publications[0].pub_id);
        }
    }, [publications, selectedPublication]);

    useEffect(() => {
        if (publications) {
            const currIndex = findIndex(publications, {
                pub_id: selectedPublication,
            });

            if (currIndex > -1) {
                // Do not use `last_pub_id` as that is the same as `pub_id` when looking at the
                //  most recent publication (Q2 2025)
                updateSelections({
                    modifiedPubId: selectedPublication,
                    originalPubId: publications[currIndex + 1]?.pub_id,
                });
            }
        }
    }, [publications, selectedPublication, updateSelections]);

    return (
        <>
            <Typography
                component="div"
                sx={{
                    p: 1,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                }}
            >
                {intl.formatMessage({ id: 'details.history.list.title' })}
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
                <List
                    sx={{
                        ['& li.Mui-selected']: {
                            cursor: 'unset',
                            borderLeft: `${historyCompareBorder} ${
                                historyCompareColors[theme.palette.mode][1]
                            }`,
                        },
                        [`& li.Mui-selected + li`]: {
                            borderLeft: `${historyCompareBorder} ${
                                historyCompareColors[theme.palette.mode][0]
                            }`,
                        },
                    }}
                >
                    {publications?.map((publication, index) => {
                        const selected =
                            selectedPublication === publication.pub_id;

                        return (
                            <ListItemButton
                                component="li"
                                key={`history-timeline-${publication.pub_id}`}
                                onClick={() => {
                                    setSelectedPublication(publication.pub_id);
                                }}
                                selected={selected}
                            >
                                <ListItemText
                                    ref={
                                        selected &&
                                        !stopScrollingIntoView.current
                                            ? scrollToTarget
                                            : undefined
                                    }
                                >
                                    <Stack component="span">
                                        <Typography
                                            component="span"
                                            variant={
                                                selected
                                                    ? 'subtitle2'
                                                    : undefined
                                            }
                                        >
                                            {formatDate(
                                                publication.published_at
                                            )}
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
                                        <Typography
                                            component="span"
                                            variant="caption"
                                        >
                                            {publication.pub_id}
                                        </Typography>
                                    </Stack>
                                </ListItemText>
                            </ListItemButton>
                        );
                    })}
                </List>
            )}
        </>
    );
}

export default PublicationList;
