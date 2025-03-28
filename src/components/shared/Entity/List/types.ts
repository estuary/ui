import { AddDialogProps } from '../AddDialog/types';
import { AddCollectionDialogCTAProps } from '../types';

import { CatalogListContent } from 'src/components/transformation/create/Config/catalog/CatalogList';

export interface EntityListProps extends AddCollectionDialogCTAProps {
    content: CatalogListContent[];
    PrimaryCTA: AddDialogProps['PrimaryCTA'];
}
