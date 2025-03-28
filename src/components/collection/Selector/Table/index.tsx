import type { TableHydratorProps } from 'src/components/shared/Entity/types';
import Hydrator from 'src/components/collection/Selector/Table/Hydrator';


function BindingSelectorTable({
    entity,
    selectedCollections,
    disableQueryParamHack,
}: TableHydratorProps) {
    return (
        <Hydrator
            entity={entity}
            selectedCollections={selectedCollections}
            disableQueryParamHack={disableQueryParamHack}
        />
    );
}

export default BindingSelectorTable;
