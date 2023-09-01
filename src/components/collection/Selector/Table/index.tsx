import { Entity } from 'types';
import Hydrator from './Hydrator';

interface Props {
    entityType: Entity;
    selectedCollections: string[];
}

function BindingSelectorTable({ entityType, selectedCollections }: Props) {
    return (
        <Hydrator
            entityType={entityType}
            selectedCollections={selectedCollections}
        />
    );
}

export default BindingSelectorTable;
