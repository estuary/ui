import { AdminPage } from './AdminPage';
import { Authentication } from './Authentication';
import { CTAs } from './CTAs';
import { Captures } from './Captures';
import { CommonMessages } from './CommonMessages';
import { Connectors } from './Connectors';
import { Errors } from './Errors';
import { EntityTable } from './EntityTable';
import { Fetchers } from './Fetchers';
import { Graphs } from './Graphs';
import { Materializations } from './Materializations';
import { MonacoEditor } from './MonacoEditor';
import { Transforms } from './Transforms';
import { Ops } from './Ops';
import { PrefixedName } from './PrefixedName';
import { RouteTitles } from './RouteTitles';
import { Workflows } from './Workflows';
import { Data } from './Data';
import { Navigation } from './Navigation';
import { Collections } from './Collections';
import { Details } from './Details';
import { Notifications } from './Notifications';
import { JsonForms } from './JsonForms';
import { HomePage } from './HomePage';
import { AccessGrants } from './AccessGrants';

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
