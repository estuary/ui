import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import {
    DetailsFormStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { FormattedMessage } from 'react-intl';
import { DetailsFormState } from 'stores/DetailsForm';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
    formStateStoreName: FormStateStoreNames;
}

function CollectionConfig({
    resourceConfigStoreName,
    detailsFormStoreName,
    formStateStoreName,
}: Props) {
    // Details Form Store
    const imageTag = useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

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

    // TODO: Determine whether this if condition is necessary.
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
                    formStateStoreName={formStateStoreName}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
