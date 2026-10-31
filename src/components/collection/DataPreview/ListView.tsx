import type { JournalRecord } from 'src/hooks/journals/types';
import type { useJournalData } from 'src/hooks/journals/useJournalData';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useEffect, useMemo, useState } from 'react';

import {
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { globalStateClasses } from '@mui/utils';

import { Editor } from '@monaco-editor/react';
import { isEmpty } from 'lodash';

import { buildRecordKey } from 'src/components/collection/DataPreview/shared';
import { EditorResizeWrapper } from 'src/components/editor/EditorResizeWrapper';
import ListAndDetails from 'src/components/editor/ListAndDetails';
import Error from 'src/components/shared/Error';
import {
    defaultOutline,
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

    const rowsByKey = useMemo(() => {
        if (error === null && data) {
            return data.documents.reduce(
                (acc, record) => {
                    acc[buildRecordKey(spec.spec.key, record)] = record;
                    return acc;
                },
                {} as Record<string, JournalRecord<Record<string, any>>>
            );
        } else {
            return {};
        }
    }, [data, error, spec.spec.key]);

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
        <Grid size={{ xs: 12 }} data-private>
            {error ? (
                <Error error={error} />
            ) : (
                <ListAndDetails
                    backgroundColor={
                        semiTransparentBackground[theme.palette.mode]
                    }
                    displayBorder
                    height={LIST_VIEW_HEIGHT}
                    removeMargin
                    sx={{ borderRadius: 3 }}
                    list={
                        // BASED ON: src/components/shared/Entity/Details/History/PublicationList.tsx
                        // I thought about making this a `styled()` component however it ended up not
                        //  sharing much and it felt weird. If we end up having more selectable lists
                        //  manually generated then we probably want to look into how we can make these
                        //  reusable more (maybe just a headless hook?)
                        // Only the keys scroll; the header stays put above them.
                        <Stack sx={{ flex: 1, minHeight: 0 }}>
                            <Typography
                                component="div"
                                sx={{
                                    p: 1,
                                    fontWeight: 500,
                                    flexShrink: 0,
                                    borderBottom:
                                        defaultOutline[theme.palette.mode],
                                }}
                            >
                                Keys
                            </Typography>
                            <List
                                disablePadding
                                sx={{
                                    flex: 1,
                                    minHeight: 0,
                                    overflowY: 'auto',
                                    [`& li.${globalStateClasses.selected}`]: {
                                        cursor: 'unset',
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
                                                <Typography component="span">
                                                    {row.key}
                                                </Typography>
                                            </ListItemText>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Stack>
                    }
                    details={
                        <EditorResizeWrapper editorHeight={LIST_VIEW_HEIGHT}>
                            <Editor
                                defaultLanguage="json"
                                height={`${LIST_VIEW_HEIGHT}px`}
                                options={{
                                    automaticLayout: true,
                                    domReadOnly: true,
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
                        </EditorResizeWrapper>
                    }
                />
            )}
        </Grid>
    );
}

export default ListView;
