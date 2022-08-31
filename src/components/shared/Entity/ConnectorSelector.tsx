import ConnectorTiles from 'components/ConnectorTiles';
import { ENTITY_WITH_CREATE } from 'types';

interface Props {
    entityType: ENTITY_WITH_CREATE;
}

function ConnectorSelector({ entityType }: Props) {
    return (
        <ConnectorTiles
            cardWidth={250}
            cardsPerRow={4}
            gridSpacing={2}
            protocolPreset={entityType}
            replaceOnNavigate
        />
    );
}

export default ConnectorSelector;
