import { client } from 'src/services/client';
import type { EntityStatusResponse } from 'src/types/controlPlane';
import { getEntityStatusSettings } from 'src/utils/env-utils';

const { entityStatusBaseEndpoint } = getEntityStatusSettings();

// Local API documentation can be found here: http://localhost:8675/api/v1/docs
export const getEntityStatus = async (
    accessToken: string,
    catalogName: string
): Promise<EntityStatusResponse[]> =>
    client(`${entityStatusBaseEndpoint}?name=${catalogName}`, {}, accessToken);
