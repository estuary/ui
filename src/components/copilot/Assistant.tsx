import { useEffect, useRef } from 'react';

import { GlobalStyles } from '@mui/material';

import { CopilotKit, useCopilotChat } from '@copilotkit/react-core';
import { Role, TextMessage } from '@copilotkit/runtime-client-gql';

import { AssistantStatusBar } from 'src/components/copilot/AssistantStatusBar';
import AssistantTerminal from 'src/components/copilot/AssistantTerminal';
import DatabaseActions from 'src/components/copilot/DatabaseActions';
import DataflowActions from 'src/components/copilot/DataflowActions';
import DocsActions from 'src/components/copilot/DocsActions';
import GraphQLActions from 'src/components/copilot/GraphQLActions';
import KapaActions from 'src/components/copilot/KapaActions';
import TaskHealthActions from 'src/components/copilot/TaskHealthActions';
import useCopilotPageContext from 'src/hooks/copilot/useCopilotPageContext';
import { useCopilotAssistantStore } from 'src/stores/Copilot/Store';
import { getCopilotSettings } from 'src/utils/env-utils';

import '@copilotkit/react-ui/styles.css';

const { runtimeUrl, licenseKey } = getCopilotSettings();

// Bridges queued messages from the store into the chat. Mounted at provider
// level so it works even when the panel was closed when triggered.
// - pendingFreshPrompt: a USER message in a freshly remounted thread ("Get help"
//   on an error), which runs the model so the assistant answers immediately.
// - pendingOpener: an ASSISTANT message appended WITHOUT running the model, so a
//   flow like "New Dataflow" opens with the agent already asking its first
//   question and no synthetic user prompt is shown.
// (pendingPrompt — used by the Explain-this-log button — is handled inside
// AssistantTerminal, which sends it through the headless chat the panel renders.)
function PromptBridge() {
    const pendingFreshPrompt = useCopilotAssistantStore(
        (state) => state.pendingFreshPrompt
    );
    const clearPendingFreshPrompt = useCopilotAssistantStore(
        (state) => state.clearPendingFreshPrompt
    );
    const pendingOpener = useCopilotAssistantStore(
        (state) => state.pendingOpener
    );
    const clearPendingOpener = useCopilotAssistantStore(
        (state) => state.clearPendingOpener
    );
    const { appendMessage, isAvailable } = useCopilotChat();

    // Guards against StrictMode's double-effect appending the opener twice.
    // Resets naturally on remount, which is exactly when a new interview
    // starts (the provider is keyed on threadNonce).
    const openerAppended = useRef(false);

    // Same guard for the "Get help" fresh-thread prompt.
    const freshPromptAppended = useRef(false);

    useEffect(() => {
        if (!pendingFreshPrompt || freshPromptAppended.current) {
            return;
        }

        // The provider remounted (keyed on threadNonce) to clear the thread, so
        // wait for the fresh runtime session before appending — an append fired
        // before isAvailable is silently dropped. A USER message (no followUp
        // flag) runs the model so the assistant answers immediately.
        if (!isAvailable) {
            return;
        }

        freshPromptAppended.current = true;
        void appendMessage(
            new TextMessage({ content: pendingFreshPrompt, role: Role.User })
        );
        clearPendingFreshPrompt();
    }, [
        pendingFreshPrompt,
        isAvailable,
        appendMessage,
        clearPendingFreshPrompt,
    ]);

    useEffect(() => {
        if (!pendingOpener || openerAppended.current) {
            return;
        }

        // The provider remounts (keyed on threadNonce) for each new interview,
        // so the thread is already empty here. Wait for the chat to be available
        // before appending — on a fresh mount the runtime session isn't ready
        // yet, and an append fired before then is silently dropped. Once ready,
        // show the agent's opening question (followUp: false → no model call);
        // the interview proceeds when the user replies.
        if (!isAvailable) {
            return;
        }

        openerAppended.current = true;
        void appendMessage(
            new TextMessage({ content: pendingOpener, role: Role.Assistant }),
            { followUp: false }
        );
        clearPendingOpener();
    }, [pendingOpener, isAvailable, appendMessage, clearPendingOpener]);

    return null;
}

// Feeds current-page context (connector, entity, docs URL) to the assistant.
function PageContext() {
    useCopilotPageContext();
    return null;
}

// Top-level assistant: CopilotKit provider + readable page context + prompt
// bridge + the terminal console. Mounted in the authenticated layout's header
// row so the terminal can push page content down as it expands.
export default function CopilotAssistant() {
    // Bumped by openWithOpener (the "New Dataflow" button). Used as the provider
    // `key` so each new interview remounts CopilotKit with a fresh, empty
    // message thread — the version's reset()/setMessages don't reliably clear
    // the v2 store, so a remount is the dependable way to start clean.
    const threadNonce = useCopilotAssistantStore((state) => state.threadNonce);
    const assistantEnabled = useCopilotAssistantStore(
        (state) => state.assistantEnabled
    );

    // Disabled: skip the CopilotKit provider, actions, and terminal entirely, but
    // keep the top-bar chrome (entity health strip, update alert, docs toggle)
    // that the terminal otherwise hosts — turning the chat off shouldn't drop the
    // status indicators.
    if (!assistantEnabled) {
        return <AssistantStatusBar />;
    }

    return (
        <>
            {/* showDevConsole={false} doesn't reliably suppress CopilotKit's v2
                web-inspector custom element (a version-bridge quirk), so hide it
                directly. */}
            <GlobalStyles
                styles={{ 'cpk-web-inspector': { display: 'none !important' } }}
            />
            <CopilotKit
                key={`thread-${threadNonce}`}
                runtimeUrl={runtimeUrl}
                publicLicenseKey={licenseKey}
                showDevConsole={false}
            >
                <PageContext />
                <DocsActions />
                <KapaActions />
                <GraphQLActions />
                <TaskHealthActions />
                <DataflowActions />
                <DatabaseActions />
                <PromptBridge />
                <AssistantTerminal />
            </CopilotKit>
        </>
    );
}
