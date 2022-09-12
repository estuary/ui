import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function CollectionConfig({
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    // Resource Config Store
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();
    const collectionsHasErrors = useResourceConfig_collectionErrorsExist();

    const hasErrors = resourceConfigHasErrors || collectionsHasErrors;

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
            <BindingsMultiEditor
                resourceConfigStoreName={resourceConfigStoreName}
                readOnly={readOnly}
            />
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
