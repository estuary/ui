import { createContext, useContext } from 'react';

import { BaseComponentProps } from 'src/types';

interface Props extends BaseComponentProps {
    value: Function;
}

const MutateDraftSpec = createContext<Function | null>(null);

const MutateDraftSpecProvider = ({ children, value }: Props) => {
    return (
        <MutateDraftSpec.Provider value={value}>
            {children}
        </MutateDraftSpec.Provider>
    );
};

const useMutateDraftSpec = () => {
    const context = useContext(MutateDraftSpec);

    if (context === null) {
        throw new Error(
            'useMutateDraftSpec must be used within a MutateDraftSpecProvider'
        );
    }

    return context;
};

export { MutateDraftSpecProvider, useMutateDraftSpec };
