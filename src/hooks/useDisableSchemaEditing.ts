import { useEntityType } from 'src/context/EntityContext';
import { useSchemaEvolution_autoDiscover } from 'src/stores/SchemaEvolution/hooks';

function useDisableSchemaEditing() {
    const entityType = useEntityType();
    const autoDiscover = useSchemaEvolution_autoDiscover();

    return Boolean(autoDiscover && entityType === 'capture');
}

export default useDisableSchemaEditing;
