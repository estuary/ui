import { LoadingButton } from '@mui/lab';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec } from 'api/draftSpecs';
import generateTransformSpec from 'components/transformation/create/generateTransformSpec';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useTransformationCreate_catalogName,
    useTransformationCreate_language,
    useTransformationCreate_name,
} from 'stores/TransformationCreate/hooks';

interface Props {
    entityNameError: string | null;
    selectedCollections: Set<string>;
}

function InitializeDraftButton({
    entityNameError,
    selectedCollections,
}: Props) {
    const language = useTransformationCreate_language();

    const entityName = useTransformationCreate_name();
    const catalogName = useTransformationCreate_catalogName();

    const validationErrorMessageId = useMemo(() => {
        if (selectedCollections.size < 1) {
            return 'newTransform.errors.collection';
        } else if (!entityName) {
            return 'newTransform.errors.name';
        } else {
            return null;
        }
    }, [entityName, selectedCollections]);

    const formInvalid = useMemo(
        () => Boolean(entityNameError ?? validationErrorMessageId),
        [entityNameError, validationErrorMessageId]
    );

    const initializeTransformation = useCallback(async (): Promise<void> => {
        if (catalogName) {
            const draftsResponse = await createEntityDraft(catalogName);

            if (draftsResponse.error) {
                // Set error state
            } else if (draftsResponse.data && draftsResponse.data.length > 0) {
                const spec = generateTransformSpec(
                    language,
                    catalogName,
                    selectedCollections
                );

                await createDraftSpec(
                    draftsResponse.data[0].id,
                    catalogName,
                    spec,
                    'collection',
                    null
                );
            } else {
                // Set error state
            }
        }
    }, [catalogName, language, selectedCollections]);

    return (
        <LoadingButton
            variant="contained"
            disabled={formInvalid}
            onClick={initializeTransformation}
        >
            <FormattedMessage id={validationErrorMessageId ?? 'cta.next'} />
        </LoadingButton>
    );
}

export default InitializeDraftButton;
