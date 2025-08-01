import { ComplianceContent } from 'src/_compliance/lang/en-US/Content';
import { AccessGrants } from 'src/lang/en-US/AccessGrants';
import { AdminPage } from 'src/lang/en-US/AdminPage';
import { Authentication } from 'src/lang/en-US/Authentication';
import { Captures } from 'src/lang/en-US/Captures';
import { Collections } from 'src/lang/en-US/Collections';
import { CommonMessages } from 'src/lang/en-US/CommonMessages';
import { Connectors } from 'src/lang/en-US/Connectors';
import { CTAs } from 'src/lang/en-US/CTAs';
import { Data } from 'src/lang/en-US/Data';
import { Details } from 'src/lang/en-US/Details';
import { EntityTable } from 'src/lang/en-US/EntityTable';
import { Errors } from 'src/lang/en-US/Errors';
import { Fetchers } from 'src/lang/en-US/Fetchers';
import { Graphs } from 'src/lang/en-US/Graphs';
import { HomePage } from 'src/lang/en-US/HomePage';
import { JsonForms } from 'src/lang/en-US/JsonForms';
import { Materializations } from 'src/lang/en-US/Materializations';
import { MonacoEditor } from 'src/lang/en-US/MonacoEditor';
import { Navigation } from 'src/lang/en-US/Navigation';
import { Notifications } from 'src/lang/en-US/Notifications';
import { Ops } from 'src/lang/en-US/Ops';
import { PrefixedName } from 'src/lang/en-US/PrefixedName';
import { RouteTitles } from 'src/lang/en-US/RouteTitles';
import { Transforms } from 'src/lang/en-US/Transforms';
import { Workflows } from 'src/lang/en-US/Workflows';

// We are not using the ResolvedIntlConfig['messages'] type because it can end up causing
//  the TS error : "Expression produces a union type that is too complex to represent"
// Since we only set messages as strings we can just use this and be safe
const enUSMessages: Record<string, string> = {
    ...AccessGrants,
    ...AdminPage,
    ...Captures,
    ...Collections,
    ...CommonMessages,
    ...Connectors,
    ...CTAs,
    ...Data,
    ...Details,
    ...EntityTable,
    ...Errors,
    ...Fetchers,
    ...Graphs,
    ...HomePage,
    ...JsonForms,
    ...Authentication,
    ...Materializations,
    ...MonacoEditor,
    ...Navigation,
    ...Notifications,
    ...Ops,
    ...PrefixedName,
    ...RouteTitles,
    ...Transforms,
    ...Workflows,
    // This MUST come last so there is a lower chance of anything being overwritten
    ...ComplianceContent,
};

export default enUSMessages;
