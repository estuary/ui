import { BaseResponse } from 'types';
import { client } from './client';

export interface SessionLocalRequest {
    auth_token: string;
}

export interface SessionLocalResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            account_id: string;
            expires_at: string;
            token: string;
        };
        links: {
            account: string;
        };
    };
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
