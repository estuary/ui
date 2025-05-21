import type {
    EntityRelationshipResponse,
    EntityStatusResponse,
} from 'src/types/controlPlane';

import { client } from 'src/services/client';
import { getEntityStatusSettings } from 'src/utils/env-utils';

const { entityStatusBaseEndpoint } = getEntityStatusSettings();

// Local API documentation can be found here: http://localhost:8675/api/v1/docs
export const getEntityStatus = async (
    accessToken: string,
    catalogName: string
): Promise<EntityStatusResponse[]> =>
    client(`${entityStatusBaseEndpoint}?name=${catalogName}`, {}, accessToken);

export const getEntityRelationships = async (
    accessToken: string,
    catalogName: string
): Promise<EntityRelationshipResponse[]> =>
    client(
        `${entityStatusBaseEndpoint}?name=${catalogName}&connected=true&short=true`,
        {},
        accessToken
    );
