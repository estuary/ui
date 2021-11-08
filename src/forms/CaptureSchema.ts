export const CaptureSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            minLength: 1,
        },
        db: {
            type: 'object',
            properties: {
                host: {
                    type: 'string',
                },
                name: {
                    type: 'string',
                },
                port: {
                    type: 'integer',
                    maximum: 65535,
                },
            },
        },
        authentication: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                pass: {
                    type: 'string',
                },
                ssl: {
                    type: 'boolean',
                },
            },
        },
    },
    required: ['host', 'name', 'port'],
};
