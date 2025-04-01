import type { PublicationSpecsExt_Spec } from 'src/api/publicationSpecsExt';
import type { DiffViewerProps } from 'src/components/shared/Entity/Details/History/types';

import { useMemo } from 'react';

import { Box, Grid, LinearProgress, Typography, useTheme } from '@mui/material';

import { DiffEditor } from '@monaco-editor/react';

import {
    formatDate,
    HEIGHT,
} from 'src/components/shared/Entity/Details/History/shared';
import {
    editorToolBarSx,
    monacoEditorComponentBackground,
} from 'src/context/Theme';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { usePublicationSpecsExt_DiffViewer } from 'src/hooks/usePublicationSpecsExt';
import { stringifyJSON } from 'src/services/stringify';

function DiffViewer({ modifiedPubId, originalPubId }: DiffViewerProps) {
    const theme = useTheme();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const { publications, isValidating } = usePublicationSpecsExt_DiffViewer(
        catalogName,
        [originalPubId, modifiedPubId]
    );

    const [modifiedSpec, originalSpec] = useMemo<
        [PublicationSpecsExt_Spec | null, PublicationSpecsExt_Spec | null]
    >(() => {
        if (publications) {
            return [
                publications.find(
                    (publication) => publication.pub_id === modifiedPubId
                ) ?? null,
                publications.find(
                    (publication) => publication.pub_id === originalPubId
                ) ?? null,
            ];
        }

        return [null, null];
    }, [modifiedPubId, originalPubId, publications]);

    return (
        <>
            <Grid container>
                <Grid item xs={6}>
                    <Box
                        sx={{
                            ...editorToolBarSx,
                        }}
                    >
                        <Typography sx={{ fontWeight: 500 }}>
                            {originalSpec
                                ? formatDate(originalSpec.published_at)
                                : '...'}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={editorToolBarSx}>
                        <Typography sx={{ fontWeight: 500 }}>
                            {modifiedSpec
                                ? formatDate(modifiedSpec.published_at)
                                : '...'}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
            {isValidating ? (
                <LinearProgress />
            ) : (
                <DiffEditor
                    height={`${HEIGHT}px`}
                    original={
                        originalSpec ? stringifyJSON(originalSpec.spec) : '---'
                    }
                    modified={
                        modifiedSpec ? stringifyJSON(modifiedSpec.spec) : '...'
                    }
                    theme={monacoEditorComponentBackground[theme.palette.mode]}
                    options={{ readOnly: true }}
                />
            )}
        </>
    );
}

export default DiffViewer;
