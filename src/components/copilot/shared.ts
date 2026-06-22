// Prompt builders for the in-dashboard assistant's button-driven entry points
// (explain log messages, explain Flow features, connector setup, error help) and
// the New Dataflow opener. These build user-message content. The assistant's
// SYSTEM PROMPT is NOT here — it's injected server-side by the runtime
// (dev/copilot-runtime/system-prompt.mjs) so it stays out of the bundle.

// Monospace stack shared by the terminal panel and its top-bar health strip.
export const TERMINAL_FONT =
    "'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

// The agent's opening question, appended (as an assistant message, no model
// call) when the "New Dataflow" button launches the interview — so the panel
// opens with the agent already asking, and no synthetic user prompt is shown.
export const NEW_DATAFLOW_OPENER =
    'Let\'s set up a new dataflow. What system do you want to capture data from? (For example: PostgreSQL, MySQL, MongoDB — or "Hello World" to try a synthetic test source.)';

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

// Builds the prompt sent when the user clicks "Get help" on an entity error
// (e.g. a failed capture save). Includes the error title, the top-level message,
// and any draft-build error details (scope + detail) so the assistant diagnoses
// the specific failure and grounds a fix via searchEstuaryKnowledge.
export const buildEntityErrorHelpPrompt = (
    title: string,
    errorMessage?: string | null,
    draftErrors?: Array<{ scope?: string; detail?: string }>
): string => {
    const lines: string[] = [
        "I'm setting up a data flow in Estuary and hit this error. Explain what's wrong and give me concrete, step-by-step instructions to fix it.",
        '',
        `Error: ${title}`,
    ];

    if (errorMessage) {
        lines.push('', errorMessage);
    }

    const details = (draftErrors ?? [])
        .map((draftError) =>
            [draftError.scope, draftError.detail].filter(Boolean).join('\n')
        )
        .filter(Boolean);

    if (details.length > 0) {
        lines.push('', 'Details:', details.join('\n\n'));
    }

    return lines.join('\n');
};
