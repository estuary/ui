import { client } from 'services/client';
import { GatewayAuthTokenResponse, Schema } from 'types';

export interface InferSchemaResponse {
    documents_read: number;
    exceeded_deadline: boolean;
    schema: Schema;
}

const getInferredSchema = (
    gatewayConfig: GatewayAuthTokenResponse,
    collection: string
): Promise<InferSchemaResponse> => {
    const { gateway_url, token } = gatewayConfig;

    const headers: HeadersInit = {};

    headers.Authorization = `Bearer ${token}`;
    headers['Content-Type'] = 'application/json';

    return client(`${gateway_url}infer_schema?collection=${collection}`, {
        headers,
    });
};

export default getInferredSchema;
