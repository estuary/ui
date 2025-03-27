import { authenticatedRoutes } from 'app/routes';
import {
    semiTransparentBackground_blue,
    semiTransparentBackground_purple,
    semiTransparentBackground_teal,
} from 'context/Theme';
import { CloudDownload, CloudUpload, DatabaseScript } from 'iconoir-react';
import { Entity } from 'types';
import { EntitySetting } from './types';

export const ENTITY_SETTINGS: { [k in Entity]: EntitySetting } = {
    capture: {
        Icon: CloudUpload,
        background: semiTransparentBackground_teal,
        bindingTermId: 'terms.bindings.plural',
        pluralId: 'terms.sources.plural',
        routes: {
            connectorSelect: authenticatedRoutes.captures.create.fullPath,
            createNewExpress:
                authenticatedRoutes.captures.createExpress.new.fullPath,
            createNew: authenticatedRoutes.captures.create.new.fullPath,
            details: authenticatedRoutes.captures.details.overview.fullPath,
            viewAll: authenticatedRoutes.captures.fullPath,
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
    },
};
