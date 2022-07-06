import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';

function CollectionConfig() {
    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const resourceConfigHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );
    const collectionsHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.collections.hasErrors
    );
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
                <BindingsMultiEditor />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CollectionConfig;
