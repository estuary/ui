import { LoopIndexContext } from './shared';
import { LoopIndexContextProps } from './types';

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
