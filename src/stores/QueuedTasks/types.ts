export interface PublicationResponse {
    created: string;
    updated: string;
    logs_token: string;
    draft_id: string;
    dry_run: boolean;
    evolve: boolean;
    job_status: string;
}

export interface PublicationsState {
    [k: string]: {
        // stuff?...
        response: PublicationResponse | null;
    };
}

export interface QueuedTasksStore {
    publicationQuery: any;
    setPublicationQuery: (params: any) => void;

    // Object keyed on the publication id that tracks the response
    publications: PublicationsState;

    addPublication: (params: any) => void;

    resetState: () => void;
}
