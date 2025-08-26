import type { EntitySetting } from 'src/settings/types';
import type { Entity } from 'src/types';

import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';

import { authenticatedRoutes } from 'src/app/routes';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'src/context/Theme';

export const ENTITY_SETTINGS: { [k in Entity]: EntitySetting } = {
    capture: {
        Icon: CloudUpload,
        background: semiTransparentBackground_teal,
        bindingTermId: 'terms.bindings.plural',
        pluralId: 'terms.sources.plural',
        routes: {
            connectorSelect: authenticatedRoutes.captures.create.fullPath,
            createNewExpress:
                authenticatedRoutes.express.captureCreate.new.fullPath,
            createNew: authenticatedRoutes.captures.create.new.fullPath,
            details: authenticatedRoutes.captures.details.overview.fullPath,
            viewAll: authenticatedRoutes.captures.fullPath,
        },
        details: {
            relatedEntitiesContentIds: {
                collections: 'data.writes_to',
                readBy: undefined,
                writtenBy: undefined,
            },
        },
        selector: {
            disableMultiSelect: true,
            filterIntlKey: 'capturesTable.filterLabel',
            headerIntlKey: null,
            optionalColumns: 'writesTo',
            noExistingDataContentIds: {
                header: 'entityTable.captures.missing.header',
                message: 'entityTable.collections.missing.message',
            },
        },
        table: {
            filterIntlKey: 'capturesTable.filterLabel',
            headerIntlKey: 'capturesTable.title',
            noExistingDataContentIds: {
                header: 'captures.message1',
                message: 'captures.message2',
            },
        },
        termId: 'terms.sources',
        workFlows: {
            bindingsEmptyTitleIntlKey:
                'entityCreate.bindingsConfig.noRowsTitle.capture',
            bindingsEmptyMessageIntlKey:
                'entityCreate.bindingsConfig.noRows.capture',
        },
    },
    collection: {
        Icon: DatabaseScript,
        background: semiTransparentBackground_blue,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.collections.plural',
        routes: {
            connectorSelect: authenticatedRoutes.collections.create.fullPath,
            createNewExpress: '',
            createNew: authenticatedRoutes.collections.create.new.fullPath,
            details: authenticatedRoutes.collections.details.overview.fullPath,
            viewAll: authenticatedRoutes.collections.fullPath,
        },
        details: {
            relatedEntitiesContentIds: {
                collections: undefined,
                readBy: 'data.readBy',
                writtenBy: 'data.writtenBy',
            },
        },
        selector: {
            filterIntlKey: 'collectionsTable.filterLabel',
            headerIntlKey: null,
            noExistingDataContentIds: {
                header: 'entityTable.collections.missing.header',
                message: 'entityTable.collections.missing.message',
            },
        },
        table: {
            filterIntlKey: 'collectionsTable.filterLabel',
            headerIntlKey: 'collectionsTable.title',
            noExistingDataContentIds: {
                header: 'entityTable.collections.missing.header',
                message: 'entityTable.collections.missing.message',
            },
        },
        termId: 'terms.collections',
        workFlows: {
            bindingsEmptyTitleIntlKey:
                'entityCreate.bindingsConfig.noRowsTitle',
            bindingsEmptyMessageIntlKey: 'entityCreate.bindingsConfig.noRows',
        },
    },
    materialization: {
        Icon: CloudDownload,
        background: semiTransparentBackground_purple,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.destinations.plural',
        routes: {
            connectorSelect:
                authenticatedRoutes.materializations.create.fullPath,
            createNewExpress: '',
            createNew: authenticatedRoutes.materializations.create.new.fullPath,
            details:
                authenticatedRoutes.materializations.details.overview.fullPath,
            viewAll: authenticatedRoutes.materializations.fullPath,
        },
        details: {
            relatedEntitiesContentIds: {
                collections: 'data.reads_from',
                readBy: undefined,
                writtenBy: undefined,
            },
        },
        selector: {
            disableMultiSelect: true,
            filterIntlKey: 'materializationsTable.filterLabel',
            headerIntlKey: null,
            optionalColumns: 'readsFrom',
            noExistingDataContentIds: {
                header: 'entityTable.materializations.missing.header',
                message: 'materializations.message2',
            },
        },
        table: {
            filterIntlKey: 'materializationsTable.filterLabel',
            headerIntlKey: 'materializationsTable.title',
            noExistingDataContentIds: {
                header: 'materializations.message1',
                message: 'materializations.message2',
            },
        },
        termId: 'terms.destinations',
        workFlows: {
            bindingsEmptyTitleIntlKey:
                'entityCreate.bindingsConfig.noRowsTitle',
            bindingsEmptyMessageIntlKey: 'entityCreate.bindingsConfig.noRows',
        },
    },
};
