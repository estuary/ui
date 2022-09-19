import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Alert, AlertTitle } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { FormattedMessage } from 'react-intl';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

interface Props {
    readOnly?: boolean;
}

function CollectionConfig({ readOnly = false }: Props) {
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

                    <FormattedMessage id="materializationCreate.collections.heading" />
                </>
            }
        >
            {resourceConfigHydrationErrorsExist ? (
                <Alert severity="error">
                    <AlertTitle>
                        <FormattedMessage id="workflows.error.initFormSection" />

                        <MessageWithLink messageID="error.message" />
                    </AlertTitle>
                </Alert>
            ) : (
                <BindingsMultiEditor readOnly={readOnly} />
            )}
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
