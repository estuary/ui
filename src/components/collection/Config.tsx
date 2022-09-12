import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function CollectionConfig({
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    // Resource Config Store
    const resourceConfigHasErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    const collectionsHasErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(resourceConfigStoreName, (state) => state.collectionErrorsExist);

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
