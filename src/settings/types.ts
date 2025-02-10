import { OptionalColumn } from 'components/collection/Selector/Table/useCollectionsSelectorColumns';
import { TableIntlConfig } from 'types';

interface TableSettings {
    noExistingDataContentIds: TableIntlConfig;
    filterIntlKey: string;
    headerIntlKey: string;
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
        create: string;
        createNew: string;
        details: string;
        viewAll: string;
    };
    selector: {
        noExistingDataContentIds: TableIntlConfig;
        filterIntlKey: string;
        headerIntlKey: string | null;
        disableMultiSelect?: boolean;
        optionalColumns?: OptionalColumn;
    };
    table: TableSettings;
    termId: string;
}
