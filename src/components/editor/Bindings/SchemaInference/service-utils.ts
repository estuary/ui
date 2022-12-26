import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction } from 'react';
import { InferSchemaResponse } from 'services/schema-inference';
import { Schema } from 'types';

export const handleInferredSchemaSuccess = (
    response: InferSchemaResponse,
    collectionSchema: Schema,
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    setInferredSchema(
        !isEmpty(response.schema)
            ? { ...collectionSchema, schema: response.schema }
            : null
    );

    setLoading(false);
};

export const handleInferredSchemaFailure = (
    error: any,
    setInferredSchema: Dispatch<SetStateAction<Schema | null | undefined>>,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    setInferredSchema(error?.code === 404 ? null : undefined);

    setLoading(false);
};
