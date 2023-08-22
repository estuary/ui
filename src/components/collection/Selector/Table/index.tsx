import Hydrator from './Hydrator';

interface Props {
    selectedCollections: string[];
}

function BindingSelectorTable({ selectedCollections }: Props) {
    return <Hydrator selectedCollections={selectedCollections} />;
}

export default BindingSelectorTable;
