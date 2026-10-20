import type { CatalogIdentityDisplayProps } from 'src/components/shared/CatalogIdentity/Edit';

import { CatalogIdentityContent } from 'src/components/shared/CatalogIdentity/Edit';

export function CatalogIdentity(props: CatalogIdentityDisplayProps) {
    return <CatalogIdentityContent mode="display" {...props} />;
}
