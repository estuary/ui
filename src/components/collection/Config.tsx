import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import {
    DetailsFormStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { CreateState } from 'stores/MiniCreate';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function CollectionConfig({
    resourceConfigStoreName,
    detailsFormStoreName,
}: Props) {
    const imageTag = useZustandStore<
        CreateState,
        CreateState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const resourceConfigHasErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    const collectionsHasErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['collectionErrorsExist']
    >(resourceConfigStoreName, (state) => state.collectionErrorsExist);

    const hasErrors = resourceConfigHasErrors || collectionsHasErrors;

    if (imageTag) {
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
                    detailsFormStoreName={detailsFormStoreName}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
