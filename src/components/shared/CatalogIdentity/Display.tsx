import type { CatalogIdentityDisplayProps } from 'src/components/shared/CatalogIdentity/CatalogIdentityContent';

import { CatalogIdentityContent } from 'src/components/shared/CatalogIdentity/CatalogIdentityContent';

export function CatalogIdentity(props: CatalogIdentityDisplayProps) {
    return <CatalogIdentityContent mode="display" {...props} />;
}
