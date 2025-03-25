import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';
import type { BaseComponentProps } from 'types';
import { LocalStorageKeys } from 'utils/localStorage-utils';

interface SidePanelDocsState {
    showDocs: boolean;
    setShowDocs: Dispatch<SetStateAction<boolean | undefined>>;
}

const SidePanelDocsContext = createContext<SidePanelDocsState | null>(null);

const SidePanelDocsProvider = ({ children }: BaseComponentProps) => {
    const [showDocs, setShowDocs] = useLocalStorage(
        LocalStorageKeys.SIDE_PANEL_DOCS,
        true
    );

    return (
        <SidePanelDocsContext.Provider
            value={{ showDocs: Boolean(showDocs), setShowDocs }}
        >
            {children}
        </SidePanelDocsContext.Provider>
    );
};

const useShowSidePanelDocs = () => {
    const context = useContext(SidePanelDocsContext);

    if (context === null) {
        throw new Error(
            'useShowSidePanelDocs must be used within a SidePanelDocsProvider'
        );
    }

    return context;
};

export { SidePanelDocsProvider, useShowSidePanelDocs };
