// Workaround for a CopilotKit/AG-UI bug (see CopilotKit issue #3644, PR #2316).
//
// With the Anthropic adapter, parallel or interleaved tool calls can serialize
// into a messages payload containing duplicate `tool_use` ids (and re-emitted
// blocks). Anthropic rejects that whole request with "tool_use ids must be
// unique", which stalls the chat run. CopilotKit builds and sends the request
// via @ai-sdk/anthropic using global fetch — not the @anthropic-ai/sdk client we
// pass it — so we sanitize at the network boundary here.
//
// This module patches global fetch and is imported FIRST in server.mjs so the
// patch is installed before any adapter code captures a fetch reference. It is
// scoped to the Anthropic messages endpoint; every other request passes through
// untouched. Throwaway dev runtime only.

const ANTHROPIC_MESSAGES = /api\.anthropic\.com\/.*\/messages/;
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
    try {
        const url =
            typeof input === 'string'
                ? input
                : input instanceof URL
                  ? input.href
                  : input?.url;

        if (
            init &&
            typeof init.body === 'string' &&
            url &&
            ANTHROPIC_MESSAGES.test(url)
        ) {
            const body = JSON.parse(init.body);
            let changed = false;

            // (a) Tell Anthropic not to emit parallel tool calls — that's the
            // trigger for colliding ids. Only when tools are present and the
            // caller hasn't already forced a specific tool_choice.
            if (Array.isArray(body.tools) && body.tools.length > 0) {
                const choiceType = body.tool_choice?.type;
                if (!body.tool_choice || choiceType === 'auto') {
                    body.tool_choice = {
                        type: 'auto',
                        disable_parallel_tool_use: true,
                    };
                    changed = true;
                }
            }

            // (b) Drop duplicate tool_use / tool_result blocks (keep the first
            // occurrence of each id) to repair any already-corrupted history.
            if (Array.isArray(body.messages)) {
                const seenUse = new Set();
                const seenResult = new Set();
                for (const message of body.messages) {
                    if (!Array.isArray(message.content)) {
                        continue;
                    }
                    const filtered = message.content.filter((block) => {
                        if (block?.type === 'tool_use') {
                            if (seenUse.has(block.id)) {
                                return false;
                            }
                            seenUse.add(block.id);
                        } else if (block?.type === 'tool_result') {
                            if (seenResult.has(block.tool_use_id)) {
                                return false;
                            }
                            seenResult.add(block.tool_use_id);
                        }
                        return true;
                    });
                    if (filtered.length !== message.content.length) {
                        message.content = filtered;
                        changed = true;
                    }
                }
            }

            if (changed) {
                init = { ...init, body: JSON.stringify(body) };
            }
        }
    } catch {
        // Any parsing hiccup: send the request unmodified.
    }

    return originalFetch(input, init);
};
