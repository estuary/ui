import { OptionalColumn } from 'components/collection/Selector/Table/useCollectionsSelectorColumns';
import { TableIntlConfig } from 'types';

export interface EntitySetting {
    Icon: React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'>
    >;
    background: { light: string; dark: string };
    bindingTermId: string;
    pluralId: string;
    routes: {
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
    table: {
        noExistingDataContentIds: TableIntlConfig;
        filterIntlKey: string;
        headerIntlKey: string;
    };
    termId: string;
}
