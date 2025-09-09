import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { DiffEditor } from '@monaco-editor/react';
import { useIntl } from 'react-intl';

import {
    formatDate,
    getSpecAsString,
    HEIGHT,
} from 'src/components/shared/Entity/Details/History/shared';
import Error from 'src/components/shared/Error';
import {
    editorToolBarSx,
    historyCompareBorder,
    historyCompareColors,
    monacoEditorComponentBackground,
} from 'src/context/Theme';
import { useHistoryDiffQueries } from 'src/hooks/useHistoryDiffQueries';
import { BASE_ERROR } from 'src/services/supabase';

// Go to next diff action has an issue -> https://github.com/Microsoft/monaco-editor/issues/2556
function DiffViewer() {
    // Data Fetching
    const {
        findModifiedPublication,
        findOriginalPublication,
        pubSpecs,
        pubHistory,
    } = useHistoryDiffQueries();

    // Hooks
    const intl = useIntl();
    const theme = useTheme();

    // Editor State management
    const [editorReady, setEditorReady] = useState(false);
    const originalModel = useRef<monacoEditor.editor.ITextModel | null>(null);
    const modifiedModel = useRef<monacoEditor.editor.ITextModel | null>(null);

    const mountHandler = (
        editor: monacoEditor.editor.IStandaloneDiffEditor,
        monaco: typeof monacoEditor
    ) => {
        // Create a model so we can keep the value updates and not have to
        //  recreate these again
        originalModel.current = monaco.editor.createModel('', 'json');
        modifiedModel.current = monaco.editor.createModel('', 'json');

        // Add the models into the editor.
        editor.setModel({
            original: originalModel.current,
            modified: modifiedModel.current,
        });

        // We keep this in state so that the useEffect down below will rerun when these are ready
        //  this is mainly here for when a users uses the browser back button.
        setEditorReady(true);
    };

    // Keep the column headers up to date
    const [modifiedPublishedAt, originalPublishedAt] = useMemo(
        () => [
            pubHistory.publications?.find(findModifiedPublication)
                ?.published_at ?? null,
            pubHistory.publications?.find(findOriginalPublication)
                ?.published_at ?? null,
        ],
        [findModifiedPublication, findOriginalPublication, pubHistory]
    );

    // Keep the diff editor up to date
    useEffect(() => {
        if (!editorReady || !pubSpecs.publications) {
            return;
        }

        // Update the model with the latest
        originalModel.current?.setValue(
            getSpecAsString(
                pubSpecs.publications.find(findOriginalPublication)?.spec ??
                    null
            )
        );
        modifiedModel.current?.setValue(
            getSpecAsString(
                pubSpecs.publications.find(findModifiedPublication)?.spec ??
                    null
            )
        );
    }, [
        editorReady,
        findModifiedPublication,
        findOriginalPublication,
        pubSpecs.publications,
    ]);

    return (
        <>
            <Grid
                container
                sx={{
                    ...editorToolBarSx,
                }}
            >
                <Grid item xs={6}>
                    <Box
                        sx={{
                            borderLeft: `${historyCompareBorder} ${
                                historyCompareColors[theme.palette.mode][0]
                            }`,
                            pl: 1,
                        }}
                    >
                        <Typography>
                            {originalPublishedAt
                                ? formatDate(originalPublishedAt)
                                : ''}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            borderLeft: `${historyCompareBorder} ${
                                historyCompareColors[theme.palette.mode][1]
                            }`,
                            pl: 1,
                        }}
                    >
                        <Typography>
                            {modifiedPublishedAt
                                ? formatDate(modifiedPublishedAt)
                                : ''}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            {pubSpecs.error ? (
                <Error
                    condensed
                    error={
                        pubSpecs.error ?? {
                            ...BASE_ERROR,
                            message: intl.formatMessage({
                                id: 'details.history.diffFailed',
                            }),
                        }
                    }
                />
            ) : (
                <DiffEditor
                    height={`${HEIGHT}px`}
                    onMount={mountHandler}
                    theme={monacoEditorComponentBackground[theme.palette.mode]}
                    options={{
                        readOnly: true,
                        // Inline diff but need to mess with making header support that
                        // enableSplitViewResizing: false,
                        // renderSideBySide: false,
                    }}
                />
            )}
        </>
    );
}

export default DiffViewer;
