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
import { MissingType, missingTypeTester } from 'forms/renderers/MissingType';
import {
    MultiLineSecret,
    multiLineSecretTester,
} from 'forms/renderers/MultiLineSecret';
import {
    NullableControl,
    nullableControlTester,
} from 'forms/renderers/NullableInput';
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
import MaterialTimeControl, {
    materialTimeControlTester,
} from 'forms/renderers/Overrides/material/controls/MaterialTimeControl';

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
    {
        renderer: MaterialTimeControl,
        tester: materialTimeControlTester,
    },

    // Custom layouts
    { renderer: OAuthType, tester: oAuthProviderTester },
    { renderer: CollapsibleGroup, tester: collapsibleGroupTester },

    // Custom controls
    { renderer: MissingType, tester: missingTypeTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
    { renderer: MultiLineSecret, tester: multiLineSecretTester },
    { renderer: NullableControl, tester: nullableControlTester },
];

export default defaultRenderers;
