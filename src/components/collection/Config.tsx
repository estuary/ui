import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BindingsMultiEditor from 'components/editor/Bindings';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { LiveSpecsExtQueryWithSpec } from 'hooks/useLiveSpecsExt';
import { FormattedMessage } from 'react-intl';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

interface Props {
    readOnly?: boolean;
    editWorkflow?: {
        initialSpec: LiveSpecsExtQueryWithSpec;
        draftSpecs: DraftSpecQuery[];
    };
}

function CollectionConfig({ readOnly = false, editWorkflow }: Props) {
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
                readOnly={readOnly}
                editWorkflow={editWorkflow}
            />
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
