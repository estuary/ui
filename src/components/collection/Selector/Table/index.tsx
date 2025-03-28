import Hydrator from './Hydrator';

import { TableHydratorProps } from 'src/components/shared/Entity/types';

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
