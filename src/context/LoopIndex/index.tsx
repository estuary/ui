import type { LoopIndexContextProps } from './types';
import { LoopIndexContext } from './shared';

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
