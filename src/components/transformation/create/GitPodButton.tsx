import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createRefreshToken } from 'api/tokens';
import generateTransformSpec from 'components/transformation/create/generateTransformSpec';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { generateGitPodURL } from 'services/gitpod';
import {
    useTransformationCreate_language,
    useTransformationCreate_name,
} from 'stores/TransformationCreate/hooks';

interface Props {
    entityNameError: string | null;
    entityPrefix: string;
    selectedCollections: Set<string>;
    postWindowOpen: (window: Window | null) => void;
}

function GitPodButton({
    entityNameError,
    entityPrefix,
    selectedCollections,
    postWindowOpen,
}: Props) {
    const intl = useIntl();

    const language = useTransformationCreate_language();
    const entityName = useTransformationCreate_name();

    const [urlLoading, setUrlLoading] = useState(false);

    const grants = useCombinedGrantsExt({ adminOnly: true });

    const allowedPrefixes = useMemo(
        () => grants.combinedGrants.map((grant) => grant.object_role),
        [grants]
    );

    const computedEntityName = useMemo(() => {
        if (entityName) {
            if (allowedPrefixes.length === 1) {
                return `${allowedPrefixes[0]}${entityName}`;
            } else if (entityPrefix) {
                return `${entityPrefix}${entityName}`;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }, [allowedPrefixes, entityName, entityPrefix]);

    const submitButtonError = useMemo(() => {
        if (selectedCollections.size < 1) {
            return intl.formatMessage({ id: 'newTransform.errors.collection' });
        }
        if (!entityName) {
            return intl.formatMessage({ id: 'newTransform.errors.name' });
        }
        return null;
    }, [intl, entityName, selectedCollections]);

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
            if (!computedEntityName) {
                throw new Error(
                    intl.formatMessage({
                        id: 'newTransform.errors.nameInvalid',
                    })
                );
            }
            const draft = await createEntityDraft(computedEntityName);
            if (draft.error) {
                throw new Error(
                    `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                );
            }
            const draftId: string = draft.data[0].id;

            const spec = generateTransformSpec(
                language,
                computedEntityName,
                selectedCollections
            );

            await createDraftSpec(
                draftId,
                computedEntityName,
                spec,
                'collection',
                null
            );
            return draftId;
        },
        [computedEntityName, intl, language, selectedCollections]
    );

    const generateUrl = useMemo(
        () => async () => {
            try {
                setUrlLoading(true);

                // This is really just here to make Typescript happy,
                // we know that computedEntityName will exist because
                // generateDraftWithSpecs() checks it and throws otherwise
                if (!computedEntityName) {
                    throw new Error(
                        intl.formatMessage({
                            id: 'newTransform.errors.nameMissing',
                        })
                    );
                }

                const [token, draftId] = await Promise.all([
                    createRefreshToken(false, '1 day'),
                    generateDraftWithSpecs(),
                ]);

                return generateGitPodURL(
                    draftId,
                    token,
                    language,
                    selectedCollections,
                    computedEntityName
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
            computedEntityName,
            displayError,
            generateDraftWithSpecs,
            intl,
            language,
            selectedCollections,
        ]
    );

    return (
        <LoadingButton
            variant="contained"
            loading={urlLoading}
            disabled={!!entityNameError || !!submitButtonError || urlLoading}
            sx={{ marginBottom: 3 }}
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
