import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { ResourceConfigStoreNames, useZustandStore } from 'context/Zustand';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';
import { ResourceConfigState } from 'stores/ResourceConfig';

interface Props {
    resourceConfigStoreName: ResourceConfigStoreNames;
}

function CollectionConfig({ resourceConfigStoreName }: Props) {
    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );

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
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
