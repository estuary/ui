import { GlobalStyles } from '@mui/material';

import { CopilotKit } from '@copilotkit/react-core';

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

// Feeds current-page context (connector, entity, docs URL) to the assistant.
function PageContext() {
    useCopilotPageContext();
    return null;
}

// Top-level assistant: CopilotKit provider + readable page context + the
// terminal console. Mounted in the authenticated layout's header row so the
// terminal can push page content down as it expands.
export default function CopilotAssistant() {
    // Bumped by openWithPromptInNewThread (the "Get help" button). Used as the
    // provider `key` so each new help request remounts CopilotKit with a fresh,
    // empty message thread — the version's reset()/setMessages don't reliably
    // clear the v2 store, so a remount is the dependable way to start clean.
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
                <AssistantTerminal />
            </CopilotKit>
        </>
    );
}
