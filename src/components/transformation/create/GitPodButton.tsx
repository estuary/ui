import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import { createRefreshToken } from 'api/tokens';
import generateTransformSpec from 'components/transformation/create/generateTransformSpec';
import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { generateGitPodURL } from 'services/gitpod';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_name,
} from 'stores/TransformationCreate/hooks';

interface Props {
    entityNameError: string | null;
    selectedCollections: Set<string>;
    postWindowOpen: (window: Window | null) => void;
}

function GitPodButton({
    entityNameError,
    selectedCollections,
    postWindowOpen,
}: Props) {
    const intl = useIntl();

    const language = useTransformationCreate_language();

    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const [urlLoading, setUrlLoading] = useState(false);

    const submitButtonError = useMemo(() => {
        if (selectedCollections.size < 1) {
            return intl.formatMessage({ id: 'newTransform.errors.collection' });
        } else if (!entityName) {
            return intl.formatMessage({ id: 'newTransform.errors.name' });
        } else {
            return null;
        }
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
            if (!catalogName) {
                throw new Error(
                    intl.formatMessage({
                        id: 'newTransform.errors.nameInvalid',
                    })
                );
            }
            const draft = await createEntityDraft(catalogName);
            if (draft.error) {
                throw new Error(
                    `[${draft.error.code}]: ${draft.error.message}, ${draft.error.details}, ${draft.error.hint}`
                );
            }
            const draftId: string = draft.data[0].id;

            const spec = generateTransformSpec(
                language,
                catalogName,
                selectedCollections
            );

            await createDraftSpec(
                draftId,
                catalogName,
                spec,
                'collection',
                null
            );
            return draftId;
        },
        [catalogName, intl, language, selectedCollections]
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

                const [token, draftId] = await Promise.all([
                    createRefreshToken(false, '1 day'),
                    generateDraftWithSpecs(),
                ]);

                return generateGitPodURL(
                    draftId,
                    token,
                    language,
                    selectedCollections,
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
            selectedCollections,
        ]
    );

    return (
        <LoadingButton
            variant="contained"
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
