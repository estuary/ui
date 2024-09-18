import { useContext } from 'react';
import { LoopIndexContext } from './shared';

export const useLoopIndex = () => {
    const context = useContext(LoopIndexContext);

    if (context === null) {
        throw new Error(
            'useLoopIndex must be used within a LoopIndexContextProvider'
        );
    }

    return context;
};
