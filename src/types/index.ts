export interface BaseHook {
    loading: boolean;
    error: string | null;
    data: any;
}

export type BaseData = {
    id: string;
    type: string;
    attributes: any;
};

export interface BaseResponse {
    data: BaseData | BaseData[];
    errors?: {
        detail: string;
        title: string;
    }[];
    links: any;
}

export interface ConnectorsResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            created_at: string;
            description: string;
            id: string;
            name: string;
            maintainer: string;
            type: string;
            updated_at: string;
        };
        links: {
            images: string;
            self: string;
        };
    }[];
    links: {
        self: string;
    };
}

export interface AuthLocalResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            account_id: string;
            expires_at: string;
            token: string;
        };
        links: {};
    };
}

export interface AccountResponse extends BaseResponse {
    data: {
        id: string;
        type: string;
        attributes: {
            created_at: string;
            display_name: string;
            email: string;
            id: string;
            name: string;
            norm_name: string;
            updated_at: string;
        };
        links: {
            self: string;
        };
    };
}

export interface AccountsResponse extends BaseResponse {
    data: AccountResponse['data'][];
    links: {
        self: string;
    };
}
