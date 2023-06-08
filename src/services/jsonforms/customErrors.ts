const generateCustomError = (instancePath: string, message: string) => {
    return {
        instancePath,
        message,
        schemaPath: '',
        keyword: '',
        params: {},
    };
};

export default generateCustomError;
