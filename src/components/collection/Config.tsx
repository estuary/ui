import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MessageWithLink from 'components/content/MessageWithLink';
import BindingsMultiEditor from 'components/editor/Bindings';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_messagePrefix } from 'stores/FormState';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

interface Props {
    draftSpecs?: DraftSpecQuery[];
    readOnly?: boolean;
}

function CollectionConfig({ draftSpecs, readOnly = false }: Props) {
    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const resourceConfigHydrationErrorsExist =
        useResourceConfig_hydrationErrorsExist();

    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    const collectionsHasErrors = useResourceConfig_collectionErrorsExist();

    const hasErrors =
        resourceConfigHydrationErrorsExist ||
        resourceConfigHasErrors ||
        collectionsHasErrors;

    return (
        <WrapperWithHeader
            header={
                <>
                    {hasErrors ? (
                        <ErrorOutlineIcon color="error" sx={{ pr: 1 }} />
                    ) : null}

                    <FormattedMessage
                        id={`${messagePrefix}.collections.heading`}
                    />
                </>
            }
        >
            {resourceConfigHydrationErrorsExist ? (
                <AlertBox
                    severity="error"
                    title={
                        <FormattedMessage id="workflows.error.initFormSection" />
                    }
                    short
                >
                    <MessageWithLink messageID="error.message" />
                </AlertBox>
            ) : (
                <BindingsMultiEditor
                    draftSpecs={draftSpecs}
                    readOnly={readOnly}
                />
            )}
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
