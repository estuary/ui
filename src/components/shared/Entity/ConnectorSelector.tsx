import ConnectorTiles from 'components/ConnectorTiles';
import { ENTITY } from 'types';

interface Props {
    entityType: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

function ConnectorSelector({ entityType }: Props) {
    return (
        <ConnectorTiles
            cardWidth={250}
            cardsPerRow={4}
            gridSpacing={2}
            protocolPreset={entityType}
        />
    );
}

export default ConnectorSelector;
