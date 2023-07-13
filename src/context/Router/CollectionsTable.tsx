import { EntityContextProvider } from 'context/EntityContext';
import Collections from 'pages/Collections';

function CollectionsTable() {
    return (
        <EntityContextProvider value="collection">
            <Collections />
        </EntityContextProvider>
    );
}

export default CollectionsTable;
