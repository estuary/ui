const FORCE_ERROR = false;

export const mockServerCall = (responseData: any) => {
    return new Promise<any>((resolve) => {
        setTimeout(() => {
            if (FORCE_ERROR) {
                resolve({
                    error: new Error('Forced server error'),
                });
            } else {
                resolve({ error: null, ...responseData });
            }
        }, 500);
    });
};
