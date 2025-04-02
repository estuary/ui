import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

import { useEffect, useMemo, useRef } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { DiffEditor } from '@monaco-editor/react';
import { useIntl } from 'react-intl';

import {
    formatDate,
    HEIGHT,
} from 'src/components/shared/Entity/Details/History/shared';
import Error from 'src/components/shared/Error';
import {
    editorToolBarSx,
    monacoEditorComponentBackground,
} from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    usePublicationSpecsExt_DiffViewer,
    usePublicationSpecsExt_History,
} from 'src/hooks/usePublicationSpecsExt';
import { stringifyJSON } from 'src/services/stringify';
import { BASE_ERROR } from 'src/services/supabase';

// Go to next diff action has an issue -> https://github.com/Microsoft/monaco-editor/issues/2556
function DiffViewer() {
    // Data Fetching
    const [catalogName, originalPubId, modifiedPubId] = useGlobalSearchParams([
        GlobalSearchParams.CATALOG_NAME,
        GlobalSearchParams.LAST_PUB_ID,
        GlobalSearchParams.PUB_ID,
    ]);

    const { publications, error } = usePublicationSpecsExt_DiffViewer(
        catalogName,
        [originalPubId, modifiedPubId]
    );

    const { publications: pubHistory } =
        usePublicationSpecsExt_History(catalogName);

    // Hooks
    const intl = useIntl();
    const theme = useTheme();

    // Editor State management
    const monacoRef = useRef<typeof monacoEditor | null>(null);
    const editorRef = useRef<monacoEditor.editor.IStandaloneDiffEditor | null>(
        null
    );
    const mountHandler = (
        editor: monacoEditor.editor.IStandaloneDiffEditor,
        monaco: typeof monacoEditor
    ) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    // Keep the column headers up to date
    const [modifiedPublishedAt, originalPublishedAt] = useMemo(
        () => [
            pubHistory?.find(
                (publication) => publication.pub_id === modifiedPubId
            )?.published_at ?? null,
            pubHistory?.find(
                (publication) => publication.pub_id === originalPubId
            )?.published_at ?? null,
        ],
        [modifiedPubId, originalPubId, pubHistory]
    );

    // Keep the diff editor up to date
    useEffect(() => {
        if (
            !editorRef.current ||
            !monacoRef.current ||
            !publications ||
            publications.length < 1
        ) {
            return;
        }

        // Do not want to trust order and strictly find by pub_id
        const modifiedPublicationSpec =
            publications.find(
                (publication) => publication.pub_id === modifiedPubId
            )?.spec ?? null;

        const originalPublicationSpec =
            publications.find(
                (publication) => publication.pub_id === originalPubId
            )?.spec ?? null;

        if (modifiedPublicationSpec || originalPublicationSpec) {
            // Snag the view state BEFORE updating model so we know where the scroll was
            const previousViewState = editorRef.current?.saveViewState();

            // This is weird but required. Otherwise we get "null" in the editor
            const modifiedPublicationSpecString = modifiedPublicationSpec
                ? (stringifyJSON(modifiedPublicationSpec) ?? '')
                : '';
            const originalPublicationSpecString = originalPublicationSpec
                ? (stringifyJSON(originalPublicationSpec) ?? '')
                : '';

            // Update the model with the latest
            editorRef.current.setModel({
                original: monacoRef.current.editor.createModel(
                    originalPublicationSpecString,
                    'json'
                ),
                modified: monacoRef.current.editor.createModel(
                    modifiedPublicationSpecString,
                    'json'
                ),
            });

            // Put the viewState back in so the scroll stays where it was
            if (previousViewState) {
                editorRef.current?.restoreViewState(previousViewState);
            }
        }
    }, [modifiedPubId, originalPubId, publications]);

    return (
        <>
            <Grid
                container
                sx={{
                    ...editorToolBarSx,
                }}
            >
                <Grid item xs={6}>
                    <Box>
                        <Typography>
                            {originalPublishedAt
                                ? formatDate(originalPublishedAt)
                                : ''}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography sx={{ fontWeight: 500 }}>
                        {modifiedPublishedAt
                            ? formatDate(modifiedPublishedAt)
                            : ''}
                    </Typography>
                </Grid>
            </Grid>
            {error ? (
                <Error
                    condensed
                    error={
                        error ?? {
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
