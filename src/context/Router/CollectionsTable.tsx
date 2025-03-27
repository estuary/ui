import { EntityContextProvider } from 'src/context/EntityContext';
import Collections from 'src/pages/Collections';

function CollectionsTable() {
    return (
        <EntityContextProvider value="collection">
            <Collections />
        </EntityContextProvider>
    );
}

export default CollectionsTable;
