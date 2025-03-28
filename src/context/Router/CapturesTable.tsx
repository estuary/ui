import { EntityContextProvider } from 'src/context/EntityContext';
import Captures from 'src/pages/Captures';

function CapturesTable() {
    return (
        <EntityContextProvider value="capture">
            <Captures />
        </EntityContextProvider>
    );
}

export default CapturesTable;
