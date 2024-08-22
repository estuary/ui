import { ConnectorTag } from 'hooks/connectors/shared';
import { StoreWithHydration } from 'stores/extensions/Hydration';

export interface ConnectorState extends StoreWithHydration {
    hydrateState: (connectorID: string) => Promise<void>;

    tag: ConnectorTag | null;
    setTag: (newVal: ConnectorState['tag']) => void;

    resetState: () => void;
}
