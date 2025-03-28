import type { Dispatch, SetStateAction } from 'react';
import type { BaseComponentProps } from 'src/types';

import { createContext, useContext } from 'react';

import { useLocalStorage } from 'react-use';

import { LocalStorageKeys } from 'src/utils/localStorage-utils';

interface DashboardWelcomeState {
    welcomeShown: boolean | undefined;
    setWelcomeShown: Dispatch<SetStateAction<boolean | undefined>>;
}

const DashboardWelcomeContext = createContext<DashboardWelcomeState | null>(
    null
);

const DashboardWelcomeProvider = ({ children }: BaseComponentProps) => {
    const [welcomeShown, setWelcomeShown] = useLocalStorage(
        LocalStorageKeys.DASHBOARD_WELCOME,
        true
    );

    return (
        <DashboardWelcomeContext.Provider
            value={{ welcomeShown, setWelcomeShown }}
        >
            {children}
        </DashboardWelcomeContext.Provider>
    );
};

const useShowDashboardWelcome = () => {
    const context = useContext(DashboardWelcomeContext);

    if (context === null) {
        throw new Error(
            'useShowDashboardWelcome must be used within a DashboardWelcomeProvider'
        );
    }

    return context;
};

export { DashboardWelcomeProvider, useShowDashboardWelcome };
