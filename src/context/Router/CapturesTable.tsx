import { EntityContextProvider } from 'context/EntityContext';
import Captures from 'pages/Captures';

function CapturesTable() {
    return (
        <EntityContextProvider value="capture">
            <Captures />
        </EntityContextProvider>
    );
}

export default CapturesTable;
