import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, modifyDraftSpec } from 'api/draftSpecs';
import { createRefreshToken } from 'api/tokens';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import generateTransformSpec from 'components/transformation/create/generateTransformSpec';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { generateGitPodURL } from 'services/gitpod';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_migrations,
    useTransformationCreate_name,
    useTransformationCreate_sourceCollections,
    useTransformationCreate_transformConfigs,
} from 'stores/TransformationCreate/hooks';

interface Props {
    postWindowOpen: (window: Window | null) => void;
    entityNameError?: string | null;
    sourceCollectionSet?: Set<string>;
    buttonVariant?: LoadingButtonProps['variant'];
}

function GitPodButton({
    postWindowOpen,
    entityNameError,
    sourceCollectionSet,
    buttonVariant,
}: Props) {
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

                const spec = generateTransformSpec(
                    language,
                    catalogName,
                    sourceCollectionArray,
                    {
                        existingTransforms,
                        existingMigrations,
                        templateFiles: true,
                    }
                );

                await modifyDraftSpec(spec, {
                    draft_id: evaluatedDraftId,
                    catalog_name: catalogName,
                    spec_type: 'collection',
                });
            } else if (sourceCollectionSet) {
                const draft = await createEntityDraft(catalogName);

                if (draft.error) {
                    throw new Error(
                        `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                    );
                }

                evaluatedDraftId = draft.data[0].id;

                const spec = generateTransformSpec(
                    language,
                    catalogName,
                    sourceCollectionSet
                );

                await createDraftSpec(
                    evaluatedDraftId,
                    catalogName,
                    spec,
                    'collection',
                    null
                );
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

    const generateUrl = useMemo(
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

                const [token, evaluatedDraftId] = await Promise.all([
                    createRefreshToken(false, '1 day'),
                    generateDraftWithSpecs(),
                ]);

                // TODO (transform): Check the length of the draft ID and throw an error appropriately.

                return generateGitPodURL(
                    evaluatedDraftId,
                    token,
                    language,
                    sourceCollectionSet ?? sourceCollectionArray,
                    catalogName
                );
            } catch (e: unknown) {
                displayError(
                    intl.formatMessage({
                        id: 'newTransform.errors.urlNotGenerated',
                    })
                );
                console.error(e);
                return null;
            } finally {
                setUrlLoading(false);
            }
        },
        [
            catalogName,
            displayError,
            generateDraftWithSpecs,
            intl,
            language,
            sourceCollectionArray,
            sourceCollectionSet,
        ]
    );

    return (
        <LoadingButton
            variant={buttonVariant ?? 'contained'}
            loading={urlLoading}
            disabled={!!entityNameError || !!submitButtonError || urlLoading}
            onClick={async () => {
                const gitpodUrl = await generateUrl();
                if (gitpodUrl) {
                    const gitPodWindow = window.open(gitpodUrl, '_blank');

                    if (!gitPodWindow || gitPodWindow.closed) {
                        displayError(
                            intl.formatMessage({
                                id: 'newTransform.errors.gitPodWindow',
                            })
                        );
                    }

                    postWindowOpen(gitPodWindow);
                }
            }}
        >
            {submitButtonError ??
                intl.formatMessage({
                    id: 'newTransform.button.cta',
                })}
        </LoadingButton>
    );
}

export default GitPodButton;
