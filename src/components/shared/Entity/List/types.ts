import { CatalogListContent } from 'components/transformation/create/Config/catalog/CatalogList';
import { AddDialogProps } from '../AddDialog/types';
import { AddCollectionDialogCTAProps } from '../types';

export interface EntityListProps extends AddCollectionDialogCTAProps {
    content: CatalogListContent[];
    PrimaryCTA: AddDialogProps['PrimaryCTA'];
}
