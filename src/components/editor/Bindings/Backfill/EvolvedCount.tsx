import { Chip } from '@mui/material';

import { useEntityType } from 'src/context/EntityContext';
import { BINDING_TERMS } from 'src/settings/entity';
import { useBinding_evolvedCollections_count } from 'src/stores/Binding/hooks';

function EvolvedCount() {
    const entityType = useEntityType();

    const evolvedCollectionsCount = useBinding_evolvedCollections_count();

    if (evolvedCollectionsCount < 1) {
        return null;
    }

    const [bindingTermSingular, bindingTermPlural] = BINDING_TERMS[entityType];
    const bindingTerm =
        evolvedCollectionsCount === 1 ? bindingTermSingular : bindingTermPlural;

    return (
        <Chip
            label={`${evolvedCollectionsCount} ${bindingTerm} reversioning`}
            aria-label="Reversioned count"
            color="info"
            variant="outlined"
        />
    );
}

export default EvolvedCount;
