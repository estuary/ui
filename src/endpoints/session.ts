import { client } from 'services/client';
import { BaseResponse } from 'types';

export interface SessionLocalRequest {
    auth_token: string;
}

export interface SessionLocalAttributes {
    account_id: string;
    expires_at: string;
    token: string;
}

export interface SessionLocalLinks {
    account: string;
}

export interface SessionLocal {
    id: string;
    type: string;
    attributes: SessionLocalAttributes;
    links: SessionLocalLinks;
}

export interface SessionLocalResponse extends BaseResponse {
    data: SessionLocal;
}

export const sessionEndpoints = {
    create: (username: SessionLocalRequest['auth_token']) => {
        return client<SessionLocalResponse, SessionLocalRequest>(
            'sessions/local',
            {
                data: { auth_token: username },
            }
        );
    },
};
