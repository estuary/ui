// System instructions and prompt builders for the in-dashboard assistant (v1:
// explain log messages, explain Flow features, give connector setup steps).

export const ASSISTANT_INSTRUCTIONS = `You are the Estuary Flow assistant, embedded in the Flow web dashboard. Flow is a real-time data-movement platform: users build "captures" (sources), "collections", and "materializations" (destinations) from connectors.

Help the user with three things:
1. Explaining task log messages — what they mean, whether they indicate a problem, and what to do next.
2. Explaining Flow features and configuration options (for example: hard deletes, delta updates, dataflow reset / backfill, standard vs delta materializations).
3. Giving clear, step-by-step setup instructions for a capture or materialization connector.

A description of the page the user is currently viewing — including the active connector and its documentation URL when applicable — is provided to you as readable context. Ground your answers in that context. When a connector documentation URL is available and relevant, mention it.

Be concise and practical: lead with the answer, then the detail. If you are unsure about Flow-specific behavior, say so rather than guessing.`;

export const buildLogExplanationPrompt = (
    message: string,
    fields?: unknown
): string => {
    const fieldsText =
        fields && Object.keys(fields as object).length > 0
            ? `\n\nStructured fields:\n${JSON.stringify(fields, null, 2)}`
            : '';

    return `Explain this Estuary Flow task log message in plain language — what it means, whether it indicates a problem, and what (if anything) I should do about it.\n\nMessage: ${message}${fieldsText}`;
};

export const buildConnectorSetupPrompt = (connectorName?: string | null) => {
    const target = connectorName ? `the ${connectorName} connector` : 'this connector';

    return `Give me step-by-step instructions to set up ${target} in Estuary Flow, including the prerequisites and the key configuration fields I need to fill in.`;
};

export const buildFeatureExplanationPrompt = (feature: string) =>
    `Explain what "${feature}" means in Estuary Flow: what it does, when I would enable it, and any trade-offs or caveats I should know about.`;
