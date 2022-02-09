import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

type NewCaptureSchemaService = {
    isFetching: boolean;
    schema: object | null;
    fetchSchema: any;
};

const useNewCaptureSchema = (): NewCaptureSchemaService => {
    const intl = useIntl();
    const [schema, setSchema] = useState<object | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(true);

    const fetchSchema = useCallback(async () => {
        const captureSchema = {
            type: 'object',
            required: ['captureName', 'image'],
            properties: {
                captureName: {
                    description: intl.formatMessage({
                        id: 'captureCreation.name.description',
                    }),
                    type: 'string',
                    minLength: 1,
                    maxLength: 1000,
                    pattern: '^[a-zA-Z0-9_.-]*/[a-zA-Z0-9_.-]+$',
                },
                image: {
                    descriptiong: intl.formatMessage({
                        id: 'captureCreation.image.description',
                    }),
                    type: 'string',
                    oneOf: [
                        {
                            const: 'ghcr.io/estuary/source-gcs:dev',
                            title: 'GCS',
                        },
                        {
                            const: 'ghcr.io/estuary/source-kafka:dev',
                            title: 'Kafka',
                        },
                        {
                            const: 'ghcr.io/estuary/source-kinesis:dev',
                            title: 'Kinesis',
                        },
                        {
                            const: 'ghcr.io/estuary/source-postgres:dev',
                            title: 'Postgres',
                        },
                        {
                            const: 'ghcr.io/estuary/source-s3:dev',
                            title: 'S3',
                        },
                    ],
                },
            },
        };

        const fetch: Promise<typeof captureSchema> = new Promise((resolve) => {
            resolve(captureSchema);
        });

        fetch.then((response) => {
            setIsFetching(false);
            setSchema(response);
        });

        return fetch;
    }, [intl]);

    useEffect(() => {
        (async () => {
            await fetchSchema();
        })();
    }, [fetchSchema]);

    return { isFetching, schema, fetchSchema };
};

export default useNewCaptureSchema;
