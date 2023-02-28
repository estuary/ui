import { createContext, useContext, useState } from 'react';
import { BaseComponentProps } from 'types';

interface Provider {
    docsURL: string | null;
    setDocsURL: (val: string | null) => void;
}

const DocsContext = createContext<Provider | null>(null);
const DocsContextProvider = ({ children }: BaseComponentProps) => {
    const [docsURL, setDocsURL] = useState<Provider['docsURL']>(null);

    return (
        <DocsContext.Provider
            value={{
                docsURL,
                setDocsURL,
            }}
        >
            {children}
        </DocsContext.Provider>
    );
};

const useDocs = () => {
    const context = useContext(DocsContext);

    if (context === null) {
        throw new Error('useDocs must be used within a DocsContextProvider');
    }

    return context;
};

export { DocsContextProvider, useDocs };
