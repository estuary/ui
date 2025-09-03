import type { OptionalColumn } from 'src/components/collection/Selector/Table/useCollectionsSelectorColumns';
import type { DetailsComponent } from 'src/components/shared/Entity/Details/Alerts/types';
import type { TableIntlConfig } from 'src/types';
import type { AlertDetails } from 'src/types/gql';

interface TableSettings {
    noExistingDataContentIds: TableIntlConfig;
    filterIntlKey: string;
    headerIntlKey: string;
}

export interface AlertSetting {
    detailKeys: (keyof AlertDetails)[];
    detailSection?: DetailsComponent;
    docLink: string;
    humanReadableIntlKey: string;
    explanationIntlKey: string;
}

export interface DataPlaneSetting {
    prefix: string;
    table: TableSettings;
}

export interface EntitySetting {
    Icon: React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'>
    >;
    background: { light: string; dark: string };
    bindingTermId: string;
    pluralId: string;
    routes: {
        connectorSelect: string;
        createNewExpress: string;
        createNew: string;
        details: string;
        viewAll: string;
    };
    details: {
        relatedEntitiesContentIds: {
            writtenBy: string | undefined;
            collections: string | undefined;
            readBy: string | undefined;
        };
    };
    selector: {
        noExistingDataContentIds: TableIntlConfig;
        filterIntlKey: string;
        headerIntlKey: string | null;
        disableMultiSelect?: boolean;
        optionalColumns?: OptionalColumn;
    };
    workFlows: {
        bindingsEmptyTitleIntlKey: string;
        bindingsEmptyMessageIntlKey: string;
    };
    table: TableSettings;
    termId: string;
}
