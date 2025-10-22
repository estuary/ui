import type {
    FieldFilter,
    PropertiesViewerProps,
} from 'src/components/schema/types';

import { useRef, useState } from 'react';

import { Box, Grid, Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import { useBindingsEditorStore_skimProjectionResponseEmpty } from 'src/components/editor/Bindings/Store/hooks';
import MonacoEditor from 'src/components/editor/MonacoEditor';
import ExistFilter from 'src/components/schema/ExistFilter';
import SchemaSelector from 'src/components/schema/SchemaSelector';
import SchemaPropertiesTable from 'src/components/tables/Schema';
import { optionalColumns } from 'src/components/tables/Schema/shared';
import TableColumnSelector from 'src/components/tables/TableColumnSelector';
import { codeBackgroundDisabled } from 'src/context/Theme';
import { useEntityWorkflow } from 'src/context/Workflow';
import { TablePrefixes } from 'src/stores/Tables/hooks';

const EDITOR_HEIGHT = 404;
const INFERRED_SCHEMA_REGEX =
    /"flow:\/\/inferred-schema":\s*{[\s\S]*?^(\s{2})}/gm;

function PropertiesViewer({ disabled, editorProps }: PropertiesViewerProps) {
    const intl = useIntl();

    const readOnlyDecorationsRef = useRef<any[]>([]);

    const workflow = useEntityWorkflow();
    const isCaptureWorkflow =
        workflow === 'capture_create' || workflow === 'capture_edit';

    const skimProjectionResponseEmpty =
        useBindingsEditorStore_skimProjectionResponseEmpty();

    const [fieldFilter, setFieldFilter] = useState<FieldFilter>('all');

    return (
        <Grid
            item
            xs={12}
            sx={{
                [`& .monaco-editor-background .cdr.read-only-content`]: {
                    backgroundColor: (theme) =>
                        codeBackgroundDisabled[theme.palette.mode],
                },
                [`& .monaco-editor-background .read-only-glyph`]: {
                    backgrounColor: (theme) =>
                        codeBackgroundDisabled[theme.palette.mode],
                },
            }}
        >
            <Stack
                sx={{
                    justifyContent: 'space-between',
                }}
                spacing={2}
                direction="row"
            >
                <Stack direction="row" spacing={1}>
                    <Typography variant="subtitle1" component="span">
                        {intl.formatMessage({
                            id: 'schemaEditor.fields.label',
                        })}
                    </Typography>
                    <SchemaSelector />
                </Stack>

                {disabled ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                    >
                        <Box style={{ width: 150 }}>
                            <ExistFilter
                                fieldFilter={fieldFilter}
                                setFieldFilter={setFieldFilter}
                                disabled={skimProjectionResponseEmpty}
                            />
                        </Box>

                        {isCaptureWorkflow ? (
                            <TableColumnSelector
                                optionalColumns={optionalColumns}
                                tablePrefix={TablePrefixes.schemaViewer}
                            />
                        ) : null}
                    </Stack>
                ) : null}
            </Stack>

            {disabled ? (
                <Box style={{ width: '100%' }}>
                    <SchemaPropertiesTable filter={fieldFilter} />
                </Box>
            ) : (
                <MonacoEditor
                    localZustandScope
                    height={EDITOR_HEIGHT}
                    onMount={(editorRef, monaco) => {
                        // Function to mark read-only regions
                        const updateReadOnlyRegions = () => {
                            if (!editorRef || !editorRef.current) {
                                return;
                            }

                            const model = editorRef.current.getModel();
                            if (!model) return;

                            const content = model.getValue();

                            // Find the flow://inferred-schema section

                            const matches = [
                                ...content.matchAll(INFERRED_SCHEMA_REGEX),
                            ];

                            // IModelDeltaDecoration
                            const decorations: any[] = [];
                            const readOnlyRanges: any[] = [];

                            matches.forEach((match) => {
                                console.log('match', match);

                                const startOffset = match.index ?? 0;
                                const endOffset = startOffset + match[0].length;

                                const startPosition =
                                    model.getPositionAt(startOffset);
                                const endPosition =
                                    model.getPositionAt(endOffset);

                                // Store the range for validation
                                readOnlyRanges.push({
                                    startLineNumber: startPosition.lineNumber,
                                    startColumn: startPosition.column,
                                    endLineNumber: endPosition.lineNumber,
                                    endColumn: endPosition.column,
                                });

                                decorations.push({
                                    range: new monaco.Range(
                                        startPosition.lineNumber,
                                        0,
                                        endPosition.lineNumber,
                                        endPosition.column
                                    ),
                                    options: {
                                        before: 'Before Text',
                                        after: 'After Text',
                                        isWholeLine: true,
                                        className: 'read-only-content',
                                        glyphMarginClassName: 'read-only-glyph',
                                        hoverMessage: {
                                            value: 'Read-only',
                                        },
                                    },
                                });
                            });

                            // Apply decorations
                            readOnlyDecorationsRef.current =
                                model.deltaDecorations(
                                    readOnlyDecorationsRef.current,
                                    decorations
                                );

                            // Prevent edits in read-only regions
                            editorRef.current.onDidChangeModelContent((e) => {
                                const changes = e.changes;
                                let shouldRevert = false;

                                for (const change of changes) {
                                    for (const range of readOnlyRanges) {
                                        // Check if the change overlaps with a read-only range
                                        if (
                                            change.range.startLineNumber <=
                                                range.endLineNumber &&
                                            change.range.endLineNumber >=
                                                range.startLineNumber
                                        ) {
                                            shouldRevert = true;
                                            break;
                                        }
                                    }
                                    if (shouldRevert) break;
                                }

                                if (shouldRevert && editorRef.current) {
                                    // Revert the change
                                    editorRef.current.executeEdits(
                                        'read-only-check',
                                        [
                                            {
                                                range: model.getFullModelRange(),
                                                text: content,
                                                forceMoveMarkers: true,
                                            },
                                        ]
                                    );

                                    // Show warning (optional)
                                    console.warn(
                                        'Cannot edit read-only section'
                                    );
                                } else {
                                    // Update content reference for next validation
                                    updateReadOnlyRegions();
                                }
                            });
                        };

                        // Initial setup
                        updateReadOnlyRegions();
                    }}
                    {...editorProps}
                />
            )}
        </Grid>
    );
}

export default PropertiesViewer;
