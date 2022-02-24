export interface BaseHook {
    loading: boolean;
    error: string | null;
    data: any;
}

export type ConnectorsResponse = {
    attributes: {
        name: string;
        description: string;
        maintainer: string;
        type: string;
        updated_at: Date;
    };
    links: {
        images: string;
    };
};
