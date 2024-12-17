import { EntityStatusResponse } from 'deps/control-plane/types';
import { client } from 'services/client';
import { getEntityStatusSettings } from 'utils/env-utils';

const { entityStatusBaseEndpoint } = getEntityStatusSettings();

export const getEntityStatus = async (
    accessToken: string,
    catalogName: string
): Promise<EntityStatusResponse> =>
    client(`${entityStatusBaseEndpoint}${catalogName}`, {}, accessToken);
