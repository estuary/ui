import { TableHydratorProps } from 'src/components/shared/Entity/types';
import Hydrator from './Hydrator';

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
