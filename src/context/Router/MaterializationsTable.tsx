import { EntityContextProvider } from 'context/EntityContext';

import Materializations from 'pages/Materializations';

function MaterializationsTable() {
    return (
        <EntityContextProvider value="materialization">
            <Materializations />
        </EntityContextProvider>
    );
}

export default MaterializationsTable;
