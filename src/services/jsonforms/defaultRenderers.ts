import { materialRenderers } from '@jsonforms/material-renderers';
import {
    CatalogName,
    catalogNameTypeTester,
} from 'forms/renderers/CatalogName';
import {
    CollapsibleGroup,
    collapsibleGroupTester,
} from 'forms/renderers/CollapsibleGroup';
import { ConnectorType, connectorTypeTester } from 'forms/renderers/Connectors';
import {
    MultiLineSecret,
    multiLineSecretTester,
} from 'forms/renderers/MultiLineSecret';
import { NullType, nullTypeTester } from 'forms/renderers/NullType';
import { oAuthProviderTester, OAuthType } from 'forms/renderers/OAuth';
import MaterialOneOfRenderer_Discriminator, {
    materialOneOfControlTester_Discriminator,
} from 'forms/renderers/Overrides/material/complex/MaterialOneOfRenderer_Discriminator';

const defaultRenderers = [
    ...materialRenderers,
    // These are basically the same as JSONForm's but with tweaks to default functionality
    {
        renderer: MaterialOneOfRenderer_Discriminator,
        tester: materialOneOfControlTester_Discriminator,
    },

    // Custom layouts
    { renderer: OAuthType, tester: oAuthProviderTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },

    // Custom controls
    { renderer: NullType, tester: nullTypeTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
    { renderer: MultiLineSecret, tester: multiLineSecretTester },
];

export default defaultRenderers;
