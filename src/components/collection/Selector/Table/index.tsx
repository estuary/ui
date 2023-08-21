import { CollectionData } from '../types';
import Hydrator from './Hydrator';

interface Props {
    selectedCollections: string[] | CollectionData[];
}

function BindingSelectorTable({ selectedCollections }: Props) {
    return <Hydrator selectedCollections={selectedCollections} />;
}

export default BindingSelectorTable;
