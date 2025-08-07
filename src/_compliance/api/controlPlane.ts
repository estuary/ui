const forceReject = false;

export const mockServerCall = (responseData: any) => {
    return new Promise<any>((resolve, reject) => {
        setTimeout(
            () => {
                if (forceReject) {
                    reject({
                        error: { message: 'foo' },
                    });
                    return;
                }
                resolve({
                    error: null,
                    ...responseData,
                });
            },
            Math.floor(Math.random() * 2000) + 1000
        );
    });
};
