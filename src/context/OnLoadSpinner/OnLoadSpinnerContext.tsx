import FullPageSpinner from 'components/fullPage/Spinner';
import { createContext, useContext, useState } from 'react';
import { BaseComponentProps } from 'types';

const OnLoadSpinnerContext = createContext<{
    setLoading: (val: boolean) => void;
    loading: boolean;
}>({
    setLoading: () => {},
    loading: true,
});

const OnLoadSpinnerProvider = ({ children }: BaseComponentProps) => {
    const [loading, setLoading] = useState(false);

    return (
        <OnLoadSpinnerContext.Provider value={{ loading, setLoading }}>
            {loading ? <FullPageSpinner /> : null}

            {children}
        </OnLoadSpinnerContext.Provider>
    );
};

const useOnLoadSpinner = () => {
    return useContext(OnLoadSpinnerContext);
};

export { OnLoadSpinnerProvider, useOnLoadSpinner };
