import type { Environment } from 'monaco-editor';

declare global {
    interface Window {
        Estuary: {
            api_endpoint: string | null;
            auth_url: string | null;
            enableDataFlowReset: boolean;
        } | null;
        dataLayer?: any[]; // Must match name we pass to GTM in index.html
        monaco: any;
        MonacoEnvironment: Environment;
        __REDUX_DEVTOOLS_EXTENSION__: any;
        // TODO (integrity | logrocket)
        // When we load in LogRocket with a script tag we'll want this
        // LogRocket?: {
        //     identify: Function;
        //     init: Function;
        //     log: Function;
        //     track: Function;
        // };
    }
}
