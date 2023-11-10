import(import.meta.env.VITE_OSANO_PATH);

if (
    import.meta.env.VITE_LOGROCKET_CDN_URL &&
    import.meta.env.VITE_LOGROCKET_ENABLED
) {
    window._lrAsyncScript = import.meta.env.VITE_LOGROCKET_CDN_URL;
}
