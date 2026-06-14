// In-memory holding pen for connector endpoint config captured via the
// human-in-the-loop form during the "New Dataflow" interview. Lives outside the
// chat transcript on purpose: credential VALUES are written here by the rendered
// form and read by the createCaptureDraft action — they are NEVER put into a
// chat message, so the LLM never sees them. Cleared after publish.
//
// Plain module singleton (not a Zustand store) because it's read imperatively
// from an action handler and never needs to drive React rendering.

let capturedConfig: Record<string, unknown> = {};

export const setCapturedConnectorConfig = (config: Record<string, unknown>) => {
    capturedConfig = config;
};

export const getCapturedConnectorConfig = (): Record<string, unknown> => {
    return capturedConfig;
};

export const clearCapturedConnectorConfig = () => {
    capturedConfig = {};
};
