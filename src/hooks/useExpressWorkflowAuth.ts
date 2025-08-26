import { useTenantStore } from 'src/stores/Tenant/Store';

const useExpressWorkflowAuth = () => {
    const tenant = useTenantStore((state) => state.selectedTenant);

    const getExpressWorkflowAuth = async (): Promise<{
        customerId: string;
        prefix: string;
        redirectURL: string;
        connectorId?: string;
    }> => {
        if (!tenant) {
            Promise.reject('tenant not found');
        }

        const waitTime = Math.floor(Math.random() * 4500 + 500);
        const employeeId = crypto.randomUUID().split('-').at(0) ?? '20c9888e';

        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                resolve({
                    customerId: `acmeCo-${employeeId}`,
                    prefix: tenant,
                    redirectURL: 'https://github.com/estuary/ui',
                });
            }, waitTime);
        });
    };

    return { getExpressWorkflowAuth };
};

export default useExpressWorkflowAuth;
