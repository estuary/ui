import FullPageSpinner from 'components/fullPage/Spinner';
import { createContext, useContext, useMemo, useState } from 'react';
import { BaseComponentProps } from 'types';

const GuardWaitingContext = createContext<{
    toggleWaiting: () => void;
    waiting: boolean;
}>({
    toggleWaiting: () => {},
    waiting: true,
});

const GuardWaitingProvider = ({ children }: BaseComponentProps) => {
    const [waiting, setWaiting] = useState(true);

    const toggler = useMemo(() => {
        return () => {
            setWaiting(!waiting);
        };
    }, [waiting]);

    if (waiting) {
        return <FullPageSpinner />;
    }

    return (
        <GuardWaitingContext.Provider
            value={{ toggleWaiting: toggler, waiting }}
        >
            {children}
        </GuardWaitingContext.Provider>
    );
};

const useGuardWaiting = () => {
    return useContext(GuardWaitingContext);
};

export { GuardWaitingProvider, useGuardWaiting };
