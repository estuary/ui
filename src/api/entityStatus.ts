import type { EntityStatusResponse } from 'types/controlPlane';
import { client } from 'services/client';
import { getEntityStatusSettings } from 'utils/env-utils';

const { entityStatusBaseEndpoint } = getEntityStatusSettings();

// Local API documentation can be found here: http://localhost:8675/api/v1/docs
export const getEntityStatus = async (
    accessToken: string,
    catalogName: string
): Promise<EntityStatusResponse[]> =>
    client(`${entityStatusBaseEndpoint}?name=${catalogName}`, {}, accessToken);
