import FullPageError from 'components/fullPage/Error';
import useTenants from 'hooks/useTenants';
import {
    Dispatch,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps, Tenants } from 'types';

const TenantContext = createContext<{
    tenants: Tenants[];
    selectedTenant: string;
    setSelectedTenant: Dispatch<SetStateAction<string>>;
} | null>(null);

const TenantContextProvider = ({ children }: BaseComponentProps) => {
    const { tenants, error, isValidating } = useTenants();

    const [selectedTenant, setSelectedTenant] = useState('');

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="tenant.error.failedToFetch.message" />
                }
            />
        );
    }

    if (isValidating) {
        return null;
    }

    return (
        <TenantContext.Provider
            value={{ tenants, selectedTenant, setSelectedTenant }}
        >
            {children}
        </TenantContext.Provider>
    );
};

const useTenantDetails = () => {
    const context = useContext(TenantContext);

    if (context === null) {
        throw new Error(
            'useTenantDetails must be used within a TenantContextProvider'
        );
    }

    return context.tenants;
};

const useSelectedTenant = () => {
    const context = useContext(TenantContext);

    if (context === null) {
        throw new Error(
            'useSelectedTenant must be used within a TenantContextProvider'
        );
    }

    return {
        selectedTenant: context.selectedTenant,
        setSelectedTenant: context.setSelectedTenant,
    };
};

export { TenantContextProvider, useSelectedTenant, useTenantDetails };
