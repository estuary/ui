import type { PublicationSpecsExt_Spec } from 'src/api/publicationSpecsExt';

import { useMemo } from 'react';

import { Box, Grid, LinearProgress, Typography, useTheme } from '@mui/material';

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
import { usePublicationSpecsExt_DiffViewer } from 'src/hooks/usePublicationSpecsExt';
import { stringifyJSON } from 'src/services/stringify';
import { BASE_ERROR } from 'src/services/supabase';

function DiffViewer() {
    const intl = useIntl();
    const theme = useTheme();
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const originalPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);
    const modifiedPubId = useGlobalSearchParams(GlobalSearchParams.PUB_ID);

    const { publications, error, isValidating } =
        usePublicationSpecsExt_DiffViewer(catalogName, [
            originalPubId,
            modifiedPubId,
        ]);

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
            <Grid
                container
                sx={{
                    ...editorToolBarSx,
                }}
            >
                <Grid item xs={6}>
                    <Box>
                        <Typography>
                            {isValidating
                                ? intl.formatMessage({ id: 'common.loading' })
                                : originalSpec
                                  ? formatDate(originalSpec.published_at)
                                  : ''}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Typography sx={{ fontWeight: 500 }}>
                        {isValidating
                            ? intl.formatMessage({ id: 'common.loading' })
                            : modifiedSpec
                              ? formatDate(modifiedSpec.published_at)
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
                    language="json"
                    height={`${HEIGHT}px`}
                    loading={<LinearProgress />}
                    original={
                        !isValidating && originalSpec
                            ? stringifyJSON(originalSpec.spec)
                            : undefined
                    }
                    modified={
                        !isValidating && modifiedSpec
                            ? stringifyJSON(modifiedSpec.spec)
                            : undefined
                    }
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
