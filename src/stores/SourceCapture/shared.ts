// Need to keep in sync with - estuary/flow/crates/models/src/source_capture.rs
export const targetNamingOptions = [
    'prefixSchema',
    'prefixNonDefaultSchema',

    // fromSourceName renamed to withSchema
    'fromSourceName',
    'withSchema',

    // leaveEmpty renamed to noSchema
    'noSchema',
    'leaveEmpty',
] as const;
