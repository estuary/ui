import type { BaseComponentProps } from 'src/types';

import { ConfigurationProvider, SemanticBranch } from 'react-semantic-tree';

// Start with explicit clicks; branches can opt into other events as needed.
const events = {
    click: true,
    mount: false,
    unmount: false,
    hover: false,
    focus: false,
    visible: false,
    scrolledAway: false,
};

export function SemanticTreeProvider({ children }: BaseComponentProps) {
    return (
        <ConfigurationProvider events={events}>
            <SemanticBranch label="Estuary">{children}</SemanticBranch>
        </ConfigurationProvider>
    );
}
