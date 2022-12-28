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
import { FreeFormType, freeFormTypeTester } from 'forms/renderers/FreeFormType';
import { MapType, mapTypeTester } from 'forms/renderers/MapType';
import {
    MultiLineSecret,
    multiLineSecretTester,
} from 'forms/renderers/MultiLineSecret';
import { NullType, nullTypeTester } from 'forms/renderers/NullType';
import { oAuthProviderTester, OAuthType } from 'forms/renderers/OAuth';
import MaterialAnyOfRenderer, {
    materialAnyOfControlTester,
} from 'forms/renderers/Overrides/material/complex/MaterialAnyOfRenderer';
import MaterialOneOfRenderer, {
    materialOneOfControlTester,
} from 'forms/renderers/Overrides/material/complex/MaterialOneOfRenderer';
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
        renderer: MaterialAnyOfRenderer,
        tester: materialAnyOfControlTester,
    },
    {
        renderer: MaterialOneOfRenderer,
        tester: materialOneOfControlTester,
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
    { renderer: NullType, tester: nullTypeTester },
    { renderer: ConnectorType, tester: connectorTypeTester },
    { renderer: CatalogName, tester: catalogNameTypeTester },
    { renderer: MultiLineSecret, tester: multiLineSecretTester },
    { renderer: MapType, tester: mapTypeTester },
    { renderer: FreeFormType, tester: freeFormTypeTester },
];

export default defaultRenderers;
