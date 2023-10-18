import FullPageSpinner from 'components/fullPage/Spinner';
import { createContext, useContext, useMemo, useState } from 'react';
import { BaseComponentProps } from 'types';

const OnLoadSpinnerContext = createContext<{
    toggleWaiting: (val: boolean) => void;
    waiting: boolean;
}>({
    toggleWaiting: () => {},
    waiting: true,
});

const OnLoadSpinnerProvider = ({ children }: BaseComponentProps) => {
    const [waiting, setWaiting] = useState(false);

    const toggler = useMemo(() => {
        return (val: boolean) => {
            setWaiting(val);
        };
    }, []);

    return (
        <OnLoadSpinnerContext.Provider
            value={{ toggleWaiting: toggler, waiting }}
        >
            {waiting ? <FullPageSpinner /> : null}

            {children}
        </OnLoadSpinnerContext.Provider>
    );
};

const useGuardWaiting = () => {
    return useContext(OnLoadSpinnerContext);
};

export { OnLoadSpinnerProvider, useGuardWaiting };
