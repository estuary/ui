const useExpressWorkflowAuth = () => {
    const getExpressWorkflowAuth = async (): Promise<{
        customerId: string;
        prefix: string;
        redirectURL: string;
        connectorId?: string;
    }> => {
        const waitTime = Math.floor(Math.random() * 4500 + 500);
        const employeeId = crypto.randomUUID().split('-').at(0) ?? '20c9888e';

        return new Promise((resolve, _reject) => {
            setTimeout(() => {
                resolve({
                    customerId: `wile-e-coyote-${employeeId}`,
                    prefix: 'fruit/',
                    redirectURL: 'https://github.com/estuary/ui',
                });
            }, waitTime);
        });
    };

    return { getExpressWorkflowAuth };
};

export default useExpressWorkflowAuth;
