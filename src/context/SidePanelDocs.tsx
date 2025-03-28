import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';
import { BaseComponentProps } from 'src/types';
import { LocalStorageKeys } from 'src/utils/localStorage-utils';

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
