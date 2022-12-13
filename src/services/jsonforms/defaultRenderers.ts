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
import MaterialDateControl, {
    materialDateControlTester,
} from 'forms/renderers/Overrides/material/controls/MaterialDateControl';
import MaterialDateTimeControl, {
    materialDateTimeControlTester,
} from 'forms/renderers/Overrides/material/controls/MaterialDateTimeControl';

const defaultRenderers = [
    ...materialRenderers,
    // These are normal renderers but customized to our needs
    {
        renderer: MaterialOneOfRenderer_Discriminator,
        tester: materialOneOfControlTester_Discriminator,
    },
    {
        renderer: MaterialDateTimeControl,
        tester: materialDateTimeControlTester,
    },
    {
        renderer: MaterialDateControl,
        tester: materialDateControlTester,
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
