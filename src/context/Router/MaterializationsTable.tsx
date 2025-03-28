import { EntityContextProvider } from 'src/context/EntityContext';
import Materializations from 'src/pages/Materializations';

function MaterializationsTable() {
    return (
        <EntityContextProvider value="materialization">
            <Materializations />
        </EntityContextProvider>
    );
}

export default MaterializationsTable;
