import type { CatalogListContent } from 'components/transformation/create/Config/catalog/CatalogList';
import type { AddDialogProps } from '../AddDialog/types';
import type { AddCollectionDialogCTAProps } from '../types';

export interface EntityListProps extends AddCollectionDialogCTAProps {
    content: CatalogListContent[];
    PrimaryCTA: AddDialogProps['PrimaryCTA'];
}
