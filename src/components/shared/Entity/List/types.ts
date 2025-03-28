import type { AddDialogProps } from 'src/components/shared/Entity/AddDialog/types';
import type { AddCollectionDialogCTAProps } from 'src/components/shared/Entity/types';
import type { CatalogListContent } from 'src/components/transformation/create/Config/catalog/CatalogList';

export interface EntityListProps extends AddCollectionDialogCTAProps {
    content: CatalogListContent[];
    PrimaryCTA: AddDialogProps['PrimaryCTA'];
}
