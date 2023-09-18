import { TableHydratorProps } from 'components/shared/Entity/types';
import Hydrator from './Hydrator';

function BindingSelectorTable({
    entity,
    selectedCollections,
}: TableHydratorProps) {
    return (
        <Hydrator entity={entity} selectedCollections={selectedCollections} />
    );
}

export default BindingSelectorTable;
