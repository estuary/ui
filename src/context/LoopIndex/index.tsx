import type { LoopIndexContextProps } from 'src/context/LoopIndex/types';

import { LoopIndexContext } from 'src/context/LoopIndex/shared';

export const LoopIndexContextProvider = ({
    children,
    value,
}: LoopIndexContextProps) => {
    return (
        <LoopIndexContext.Provider value={value}>
            {children}
        </LoopIndexContext.Provider>
    );
};
