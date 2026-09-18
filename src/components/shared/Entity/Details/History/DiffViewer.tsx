import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import type { MutableRefObject } from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
    Box,
    Grid,
    IconButton,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { DiffEditor } from '@monaco-editor/react';
import { ArrowDown, ArrowUp } from 'iconoir-react';

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
import { logRocketConsole } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';

function DiffNavigation({
    disabled,
    onNavigate,
}: {
    disabled: boolean;
    onNavigate: (direction: 'previous' | 'next') => void;
}) {
    return (
        <Grid>
            {(['previous', 'next'] as const).map((direction) => {
                const label =
                    direction === 'previous'
                        ? 'Previous change'
                        : 'Next change';

                return (
                    <Tooltip key={direction} title={label}>
                        <span>
                            <IconButton
                                aria-label={label}
                                size="small"
                                disabled={disabled}
                                onClick={() => onNavigate(direction)}
                            >
                                {direction === 'previous' ? (
                                    <ArrowUp />
                                ) : (
                                    <ArrowDown />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                );
            })}
        </Grid>
    );
}

function DiffViewer() {
    // Data Fetching
    const {
        findModifiedPublication,
        findOriginalPublication,
        pubSpecs,
        pubHistory,
    } = useHistoryDiffQueries();

    // Hooks
    const theme = useTheme();

    // Editor State management
    const [editorReady, setEditorReady] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const diffSubscriptions = useRef<monacoEditor.IDisposable[]>([]);
    const diffEditorRef =
        useRef<monacoEditor.editor.IStandaloneDiffEditor | null>(null);
    const originalModel = useRef<monacoEditor.editor.ITextModel | null>(null);
    const modifiedModel = useRef<monacoEditor.editor.ITextModel | null>(null);

    const mountHandler = (
        editor: monacoEditor.editor.IStandaloneDiffEditor,
        monaco: typeof monacoEditor
    ) => {
        // Store the editor reference
        diffEditorRef.current = editor;

        // Create a model so we can keep the value updates and not have to
        //  recreate these again
        originalModel.current = monaco.editor.createModel('', 'json');
        modifiedModel.current = monaco.editor.createModel('', 'json');

        // Add the models into the editor.
        editor.setModel({
            original: originalModel.current,
            modified: modifiedModel.current,
        });

        // Navigation is available only after the current models' diff is computed.
        diffSubscriptions.current.forEach((subscription) =>
            subscription.dispose()
        );
        setHasChanges(false);
        diffSubscriptions.current = [
            originalModel.current.onDidChangeContent(() =>
                setHasChanges(false)
            ),
            modifiedModel.current.onDidChangeContent(() =>
                setHasChanges(false)
            ),
            editor.onDidUpdateDiff(() => {
                setHasChanges((editor.getLineChanges()?.length ?? 0) > 0);
            }),
        ];

        // We keep this in state so that the useEffect down below will rerun when these are ready
        //  this is mainly here for when a users uses the browser back button.
        setEditorReady(true);
    };

    // Cleanup effect - dispose in the correct order
    useEffect(() => {
        return () => {
            diffSubscriptions.current.forEach((subscription) =>
                subscription.dispose()
            );
            const cleanUpEditorRef = (editorRef: MutableRefObject<any>) => {
                if (editorRef?.current) {
                    try {
                        if (editorRef.current.setModel) {
                            editorRef.current.setModel(null);
                        }
                        if (editorRef.current.dispose) {
                            editorRef.current.dispose();
                        }
                    } catch (error) {
                        logRocketConsole('Error disposing editor', {
                            error,
                        });
                    }
                    editorRef.current = null;
                }
            };

            // Reset editor model first to release references
            if (diffEditorRef.current) {
                cleanUpEditorRef(diffEditorRef);
            }

            // Now safe to dispose the text models
            if (originalModel.current) {
                cleanUpEditorRef(originalModel);
            }

            if (modifiedModel.current) {
                cleanUpEditorRef(modifiedModel);
            }
        };
    }, []);

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

    const originalSpec = pubSpecs.publications
        ? getSpecAsString(
              pubSpecs.publications.find(findOriginalPublication)?.spec ?? null
          )
        : undefined;
    const modifiedSpec = pubSpecs.publications
        ? getSpecAsString(
              pubSpecs.publications.find(findModifiedPublication)?.spec ?? null
          )
        : undefined;

    // setValue resets selection and recomputes the diff, so only update changed text.
    useEffect(() => {
        if (!editorReady) {
            return;
        }

        if (
            originalSpec !== undefined &&
            originalModel.current &&
            originalModel.current.getValue() !== originalSpec
        ) {
            originalModel.current.setValue(originalSpec);
        }
        if (
            modifiedSpec !== undefined &&
            modifiedModel.current &&
            modifiedModel.current.getValue() !== modifiedSpec
        ) {
            modifiedModel.current.setValue(modifiedSpec);
        }
    }, [editorReady, originalSpec, modifiedSpec]);

    return (
        <>
            <Grid
                container
                alignItems="center"
                sx={{
                    ...editorToolBarSx,
                }}
            >
                <Grid size={{ xs: 6 }}>
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
                <Grid size="grow">
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
                <DiffNavigation
                    disabled={!editorReady || !hasChanges || !!pubSpecs.error}
                    onNavigate={(direction) =>
                        diffEditorRef.current?.goToDiff(direction)
                    }
                />
            </Grid>
            {pubSpecs.error ? (
                <Error
                    condensed
                    error={
                        pubSpecs.error ?? {
                            ...BASE_ERROR,
                            message: `Unable to get specs to compare.`,
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
