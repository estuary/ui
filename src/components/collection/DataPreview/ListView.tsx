import type { JournalRecord } from 'src/hooks/journals/types';
import type { useJournalData } from 'src/hooks/journals/useJournalData';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme,
} from '@mui/material';

import { Editor } from '@monaco-editor/react';
import { JsonPointer } from 'json-ptr';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import ListAndDetails from 'src/components/editor/ListAndDetails';
import Error from 'src/components/shared/Error';
import {
    defaultOutline,
    historyCompareBorder,
    historyCompareColors,
    monacoEditorComponentBackground,
    semiTransparentBackground,
} from 'src/context/Theme';
import { stringifyJSON } from 'src/services/stringify';

const LIST_VIEW_HEIGHT = 425;

interface PreviewJsonModeProps {
    spec: LiveSpecsQuery_details;
    journalData: ReturnType<typeof useJournalData>;
}

function ListView({
    spec,
    journalData: { data, error },
}: PreviewJsonModeProps) {
    const [selectedKey, setSelectedKey] = useState<string>('');

    const theme = useTheme();
    const intl = useIntl();

    const buildRecordKey = useCallback(
        (record: Record<string, any>) => {
            return spec.spec.key
                .map((k: string) => JsonPointer.get(record, k))
                .join('_');
        },
        [spec.spec.key]
    );

    const rowsByKey = useMemo(() => {
        if (error === null && data) {
            return data.documents.reduce(
                (acc, record) => {
                    acc[buildRecordKey(record)] = record;
                    return acc;
                },
                {} as Record<string, JournalRecord<Record<string, any>>>
            );
        } else {
            return {};
        }
    }, [buildRecordKey, data, error]);

    const rows = useMemo(
        () => Object.keys(rowsByKey).map((k) => ({ key: k, id: k })),
        [rowsByKey]
    );

    const selectedRecordJson = useMemo(
        () => stringifyJSON(rowsByKey[selectedKey]),
        [rowsByKey, selectedKey]
    );

    useEffect(() => {
        if (!isEmpty(rowsByKey)) {
            const firstKey = Object.keys(rowsByKey)[0];
            setSelectedKey(firstKey);
        }
    }, [rowsByKey]);

    return (
        <Grid item xs={12} data-private>
            {error ? (
                <Error error={error} />
            ) : (
                <ListAndDetails
                    backgroundColor={
                        semiTransparentBackground[theme.palette.mode]
                    }
                    displayBorder
                    height={LIST_VIEW_HEIGHT}
                    list={
                        // BASED ON: src/components/shared/Entity/Details/History/PublicationList.tsx
                        // I thought about making this a `styled()` component however it ended up not
                        //  sharing much and it felt weird. If we end up having more selectable lists
                        //  manually generated then we probably want to look into how we can make these
                        //  reusable more (maybe just a headless hook?)
                        <>
                            <Typography
                                component="div"
                                sx={{
                                    p: 1,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {intl.formatMessage({
                                    id: 'detailsPanel.dataPreview.listView.header',
                                })}
                            </Typography>
                            <List
                                sx={{
                                    ['& li.Mui-selected']: {
                                        cursor: 'unset',
                                        borderLeft: `${historyCompareBorder} ${
                                            historyCompareColors[
                                                theme.palette.mode
                                            ][1]
                                        }`,
                                    },
                                    ['& li']: {
                                        borderBottom: () =>
                                            defaultOutline[theme.palette.mode],
                                    },
                                }}
                            >
                                {rows.map((row) => {
                                    const selected = selectedKey === row.key;

                                    return (
                                        <ListItemButton
                                            component="li"
                                            key={`data-preview-${row.key}`}
                                            selected={selected}
                                            onClick={() => {
                                                setSelectedKey(row.key);
                                            }}
                                        >
                                            <ListItemText>
                                                <Typography
                                                    component="span"
                                                    variant={
                                                        selected
                                                            ? 'subtitle2'
                                                            : undefined
                                                    }
                                                >
                                                    {row.key}
                                                </Typography>
                                            </ListItemText>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </>
                    }
                    details={
                        <Editor
                            defaultLanguage="json"
                            height={LIST_VIEW_HEIGHT}
                            options={{
                                lineNumbers: 'off',
                                readOnly: true,
                            }}
                            saveViewState={false}
                            value={selectedRecordJson}
                            theme={
                                monacoEditorComponentBackground[
                                    theme.palette.mode
                                ]
                            }
                        />
                    }
                />
            )}
        </Grid>
    );
}

export default ListView;
