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
    collection: {
        Icon: DatabaseScript,
        background: semiTransparentBackground_blue,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.collections.plural',
        routes: {
            details: authenticatedRoutes.collections.details.overview.fullPath,
            viewAll: authenticatedRoutes.collections.fullPath,
        },
        selector: {
            filterIntlKey: 'collectionsTable.filterLabel',
            headerIntlKey: null,
            noExistingDataContentIds: {
                header: 'entityTable.captures.missing.header',
                message: 'entityTable.collections.missing.message2',
            },
        },
        table: {
            filterIntlKey: 'collectionsTable.filterLabel',
            headerIntlKey: 'collectionsTable.title',
            noExistingDataContentIds: {
                header: 'entityTable.captures.missing.header',
                message: 'entityTable.collections.missing.message2',
            },
        },
        termId: 'terms.collections',
    },
    capture: {
        Icon: CloudUpload,
        background: semiTransparentBackground_teal,
        bindingTermId: 'terms.bindings.plural',
        pluralId: 'terms.sources.plural',
        routes: {
            details: authenticatedRoutes.captures.details.overview.fullPath,
            viewAll: authenticatedRoutes.captures.fullPath,
        },
        selector: {
            filterIntlKey: 'capturesTable.filterLabel',
            headerIntlKey: null,
            noExistingDataContentIds: {
                header: 'entityTable.collections.missing.header',
                message: 'entityTable.collections.missing.message2',
            },
        },
        table: {
            filterIntlKey: 'capturesTable.filterLabel',
            headerIntlKey: 'capturesTable.title',
            noExistingDataContentIds: {
                header: 'entityTable.collections.missing.header',
                message: 'entityTable.collections.missing.message2',
            },
        },
        termId: 'terms.sources',
    },
    materialization: {
        Icon: CloudDownload,
        background: semiTransparentBackground_purple,
        bindingTermId: 'terms.collections.plural',
        pluralId: 'terms.destinations.plural',
        routes: {
            details:
                authenticatedRoutes.materializations.details.overview.fullPath,
            viewAll: authenticatedRoutes.materializations.fullPath,
        },
        selector: {
            filterIntlKey: 'materializationsTable.filterLabel',
            headerIntlKey: null,
            noExistingDataContentIds: {
                header: 'entityTable.materializations.missing.header',
                message: 'entityTable.materializations.missing.message2',
            },
        },
        table: {
            filterIntlKey: 'materializationsTable.filterLabel',
            headerIntlKey: 'materializationsTable.title',
            noExistingDataContentIds: {
                header: 'entityTable.materializations.missing.header',
                message: 'entityTable.materializations.missing.message2',
            },
        },
        termId: 'terms.destinations',
    },
};
