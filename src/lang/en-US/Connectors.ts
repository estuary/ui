import { CommonMessages } from 'src/lang/en-US/CommonMessages';

export const Connectors: Record<string, string> = {
    'connectorTable.title': `Installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.title.aria': `Table of all installed ${CommonMessages['terms.connectors']}`,
    'connectorTable.filterLabel': `Search connectors`,
    'connectorTable.data.title': `Name`,
    'connectorTable.data.detail': `Details`,
    'connectorTable.data.protocol': `Protocol`,
    'connectorTable.data.updated_at': `Last Updated`,
    'connectorTable.data.documentation_url': `Documentation`,
    'connectorTable.data.external_url': `Homepage`,
    'connectorTable.data.actions': `Actions`,
    'connectorTable.data.connectorRequest': `New Connector`,
    'connectorTable.actionsCta.capture': `Capture`,
    'connectorTable.actionsCta.materialization': `Materialize`,
    'connectorTable.actionsCta.connectorRequest': `Contact Estuary`,
    'connectors.header': `Connectors`,
    'connectors.main.message1': `There are no connectors available matching your search.`,
    'connectors.main.message2.alt': `To request a connector for a new system, click "Contact Estuary" and submit the form.`,
    'connectors.main.message2': `To request a connector for a system that isn't yet supported, {docLink}.`,
    'connectors.main.message2.docLink': `contact Estuary`,
    'connectors.main.message2.docPath': `https://github.com/estuary/connectors/issues/new?assignees=&labels=new+connector&template=request-new-connector-form.yaml&title=Request+a+connector+to+%5Bcapture+from+%7C+materialize+to%5D+%5Byour+favorite+system%5D`,
};
