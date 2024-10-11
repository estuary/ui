import React, { useCallback, useContext, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BaseComponentProps } from 'types';

const UpdateHelmetContext = React.createContext<{
    updateDescription: (newVal: string | undefined) => void;
    updateOgTitle: (newVal: string | undefined) => void;
    updateTitle: (newVal: string) => void;
}>({
    updateTitle: () => {},
    updateDescription: () => {},
    updateOgTitle: () => {},
});

// Instead of using the component directly we do this to make it easier to wire up
//  the already created hook useBrowserTitle into Helmet. If we want to add more
//  properties to contorl we should take the time to work out another way of routes
//  controlling Helmet. Probably want to "build it into" React Router configuration.
const UpdateHelmetProvider = ({ children }: BaseComponentProps) => {
    const [title, setTitle] = useState<string | null>(null);
    const [description, setDescription] = useState<string | undefined>(
        undefined
    );
    const [ogTitle, setOgTitle] = useState<string | undefined>(undefined);

    const updateTitle = useCallback((newTitle: string) => {
        setTitle(newTitle);
    }, []);

    const updateDescription = useCallback(
        (newDescription: string | undefined) => {
            setDescription(newDescription);
        },
        []
    );

    const updateOgTitle = useCallback((newMetaTitle: string | undefined) => {
        setOgTitle(newMetaTitle);
    }, []);

    return (
        <HelmetProvider>
            <UpdateHelmetContext.Provider
                value={{
                    updateDescription,
                    updateOgTitle,
                    updateTitle,
                }}
            >
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />

                    <meta property="og:title" content={ogTitle} />
                    <meta property="og:description" content={description} />
                </Helmet>
                {children}
            </UpdateHelmetContext.Provider>
        </HelmetProvider>
    );
};

const useUpdateHelmet = () => useContext(UpdateHelmetContext);

export { UpdateHelmetProvider, useUpdateHelmet };
