import React, { useCallback, useContext, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BaseComponentProps } from 'types';

const UpdateHelmetContext = React.createContext<{
    updateDescription: (newVal: string | undefined) => void;
    updateMetaTitle: (newVal: string | undefined) => void;
    updateTitle: (newVal: string) => void;
}>({
    updateTitle: () => {},
    updateDescription: () => {},
    updateMetaTitle: () => {},
});

const UpdateHelmetProvider = ({ children }: BaseComponentProps) => {
    const [title, setTitle] = useState<string | null>(null);
    const [metaDescription, setMetaDescription] = useState<string | undefined>(
        undefined
    );
    const [metaTitle, setMetaTitle] = useState<string | undefined>(undefined);

    const updateTitle = useCallback((newTitle: string) => {
        setTitle(newTitle);
    }, []);

    const updateDescription = useCallback(
        (newDescription: string | undefined) => {
            setMetaDescription(newDescription);
        },
        []
    );

    const updateMetaTitle = useCallback((newMetaTitle: string | undefined) => {
        setMetaTitle(newMetaTitle);
    }, []);

    return (
        <HelmetProvider>
            <UpdateHelmetContext.Provider
                value={{
                    updateDescription,
                    updateMetaTitle,
                    updateTitle,
                }}
            >
                <Helmet>
                    <title>{title}</title>
                    <meta property="og:title" content={metaTitle} />
                    <meta property="og:description" content={metaDescription} />
                </Helmet>
                {children}
            </UpdateHelmetContext.Provider>
        </HelmetProvider>
    );
};

const useUpdateHelmet = () => useContext(UpdateHelmetContext);

export { UpdateHelmetProvider, useUpdateHelmet };
