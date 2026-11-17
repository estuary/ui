import type { DraftIdGeneratorButtonProps } from 'src/components/transformation/create/types';

import { useCallback, useMemo, useState } from 'react';

import { Button } from '@mui/material';

import { usePostHog } from '@posthog/react';
import { useSnackbar } from 'notistack';

import { createEntityDraft } from 'src/api/drafts';
import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import { EVENT_NAME } from 'src/components/transformation/create/shared';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_migrations,
    useTransformationCreate_name,
    useTransformationCreate_sourceCollections,
    useTransformationCreate_transformConfigs,
} from 'src/stores/TransformationCreate/hooks';
import { generateInitialSpec } from 'src/utils/derivation-utils';

function DraftIdGeneratorButton({
    draftCreationCallback,
    entityNameError,
    sourceCollectionSet,
    buttonVariant,
}: DraftIdGeneratorButtonProps) {
    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Transform Create Store
    const sourceCollectionArray = useTransformationCreate_sourceCollections();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();

    const language = useTransformationCreate_language();
    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const postHog = usePostHog();
    const [urlLoading, setUrlLoading] = useState(false);

    const submitButtonError = useMemo(() => {
        if (sourceCollectionSet && sourceCollectionSet.size < 1) {
            return 'Select source collections';
        } else if (!entityName) {
            return 'Name your Derived Collection';
        } else {
            return null;
        }
    }, [entityName, sourceCollectionSet]);

    const { enqueueSnackbar } = useSnackbar();
    const displayError = useCallback(
        (message: string) => {
            enqueueSnackbar(message, {
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
                variant: 'error',
            });
        },
        [enqueueSnackbar]
    );

    const generateDraftWithSpecs = useMemo(
        () => async () => {
            if (!catalogName) {
                throw new Error('Invalid entity name');
            }

            let evaluatedDraftId = '';

            if (draftId) {
                evaluatedDraftId = draftId;

                const existingMigrations = Object.values(migrations);
                const existingTransforms = Object.values(transformConfigs);

                const spec = generateInitialSpec(
                    language,
                    catalogName,
                    sourceCollectionArray,
                    {
                        existingTransforms,
                        existingMigrations,
                        templateFiles: true,
                    }
                );

                const modifyResponse = await modifyDraftSpec(spec, {
                    draft_id: evaluatedDraftId,
                    catalog_name: catalogName,
                    spec_type: 'collection',
                });

                if (modifyResponse.error) {
                    throw new Error(
                        'We failed to apply a template to your draft.'
                    );
                }
            } else if (sourceCollectionSet) {
                const draft = await createEntityDraft(catalogName);

                if (draft.error) {
                    throw new Error(
                        `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                    );
                }

                evaluatedDraftId = draft.data[0].id;

                const spec = generateInitialSpec(
                    language,
                    catalogName,
                    sourceCollectionSet,
                    { templateFiles: true }
                );

                const createResponse = await createDraftSpec(
                    evaluatedDraftId,
                    catalogName,
                    spec,
                    'collection',
                    null
                );

                if (createResponse.error) {
                    throw new Error(
                        'We failed to generate your draft. Try again and if the issue persists please contact support.'
                    );
                }
            }

            return evaluatedDraftId;
        },
        [
            catalogName,
            draftId,
            language,
            migrations,
            sourceCollectionArray,
            sourceCollectionSet,
            transformConfigs,
        ]
    );

    const generateDraftId = useMemo(
        () => async () => {
            try {
                setUrlLoading(true);

                // This is really just here to make Typescript happy,
                // we know that computedEntityName will exist because
                // generateDraftWithSpecs() checks it and throws otherwise
                if (!catalogName) {
                    throw new Error('Missing entity name');
                }

                const evaluatedDraftId = await generateDraftWithSpecs();

                if (!evaluatedDraftId) {
                    throw new Error(
                        'We failed to generate your draft. Try again and if the issue persists please contact support.'
                    );
                }

                postHog.capture(EVENT_NAME, {
                    status: 'success',
                    language,
                });

                return evaluatedDraftId;
            } catch (e: unknown) {
                postHog.capture(EVENT_NAME, {
                    status: 'failure',
                    language,
                });
                displayError(
                    'We failed to generate your draft. Try again and if the issue persists please contact support.'
                );
                console.error(e);
                return null;
            } finally {
                setUrlLoading(false);
            }
        },
        [catalogName, displayError, generateDraftWithSpecs, language, postHog]
    );

    return (
        <Button
            variant={buttonVariant ?? 'contained'}
            loading={Boolean(urlLoading)}
            disabled={!!entityNameError || !!submitButtonError || urlLoading}
            onClick={async () => {
                const generatedDraftId = await generateDraftId();
                if (generatedDraftId) {
                    if (draftCreationCallback) {
                        draftCreationCallback(generatedDraftId);
                    }
                }
            }}
        >
            {submitButtonError ? submitButtonError : 'Create Draft'}
        </Button>
    );
}

export default DraftIdGeneratorButton;
