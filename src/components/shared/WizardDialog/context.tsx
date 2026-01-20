import type { WizardContextValue } from 'src/components/shared/WizardDialog/types';

import { createContext, useContext } from 'react';

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
    const context = useContext(WizardContext);

    if (!context) {
        throw new Error('useWizard must be used within a WizardDialog');
    }

    return context;
}

export { WizardContext };
