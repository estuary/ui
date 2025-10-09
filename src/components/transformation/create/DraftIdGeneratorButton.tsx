import type { DraftIdGeneratorButtonProps } from 'src/components/transformation/create/types';

import { useCallback, useMemo, useState } from 'react';

import { useSnackbar } from 'notistack';
import { useIntl } from 'react-intl';

import { createEntityDraft } from 'src/api/drafts';
import { createDraftSpec, modifyDraftSpec } from 'src/api/draftSpecs';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import SafeLoadingButton from 'src/components/SafeLoadingButton';
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
    const intl = useIntl();

    // Draft Editor Store
    const draftId = useEditorStore_id();

    // Transform Create Store
    const sourceCollectionArray = useTransformationCreate_sourceCollections();
    const transformConfigs = useTransformationCreate_transformConfigs();
    const migrations = useTransformationCreate_migrations();

    const language = useTransformationCreate_language();
    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const [urlLoading, setUrlLoading] = useState(false);

    const submitButtonError = useMemo(() => {
        if (sourceCollectionSet && sourceCollectionSet.size < 1) {
            return intl.formatMessage({ id: 'newTransform.errors.collection' });
        } else if (!entityName) {
            return intl.formatMessage({ id: 'newTransform.errors.name' });
        } else {
            return null;
        }
    }, [intl, entityName, sourceCollectionSet]);

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
                throw new Error(
                    intl.formatMessage({
                        id: 'newTransform.errors.nameInvalid',
                    })
                );
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
                        intl.formatMessage({
                            id: 'newTransform.errors.draftModifyFailed',
                        })
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
                        intl.formatMessage({
                            id: 'newTransform.errors.draftCreateFailed',
                        })
                    );
                }
            }

            return evaluatedDraftId;
        },
        [
            catalogName,
            draftId,
            intl,
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
                    throw new Error(
                        intl.formatMessage({
                            id: 'newTransform.errors.nameMissing',
                        })
                    );
                }

                const evaluatedDraftId = await generateDraftWithSpecs();

                if (!evaluatedDraftId) {
                    throw new Error(
                        intl.formatMessage({
                            id: 'newTransform.errors.draftCreateFailed',
                        })
                    );
                }

                return evaluatedDraftId;
            } catch (e: unknown) {
                displayError(
                    intl.formatMessage({
                        id: 'newTransform.errors.draftCreateFailed',
                    })
                );
                console.error(e);
                return null;
            } finally {
                setUrlLoading(false);
            }
        },
        [catalogName, displayError, generateDraftWithSpecs, intl]
    );

    return (
        <SafeLoadingButton
            variant={buttonVariant ?? 'contained'}
            loading={urlLoading}
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
            {submitButtonError
                ? submitButtonError
                : intl.formatMessage({
                      id: 'newTransform.button.cta',
                  })}
        </SafeLoadingButton>
    );
}

export default DraftIdGeneratorButton;
