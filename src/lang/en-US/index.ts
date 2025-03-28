import { AccessGrants } from './AccessGrants';
import { AdminPage } from './AdminPage';
import { Authentication } from './Authentication';
import { Captures } from './Captures';
import { Collections } from './Collections';
import { CommonMessages } from './CommonMessages';
import { Connectors } from './Connectors';
import { CTAs } from './CTAs';
import { Data } from './Data';
import { Details } from './Details';
import { EntityTable } from './EntityTable';
import { Errors } from './Errors';
import { Fetchers } from './Fetchers';
import { Graphs } from './Graphs';
import { HomePage } from './HomePage';
import { JsonForms } from './JsonForms';
import { Materializations } from './Materializations';
import { MonacoEditor } from './MonacoEditor';
import { Navigation } from './Navigation';
import { Notifications } from './Notifications';
import { Ops } from './Ops';
import { PrefixedName } from './PrefixedName';
import { RouteTitles } from './RouteTitles';
import { Transforms } from './Transforms';
import { Workflows } from './Workflows';

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
};

export default enUSMessages;
