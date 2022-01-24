import { ResolvedIntlConfig } from "react-intl/src/types";

const enUSMessages: ResolvedIntlConfig['messages'] = {
    "common.loading": `Loading`,
    "captures.main.message1": `Click the "New Capture" button up above to get started.`,
    "captures.main.message2": `It will guide you through generating and downloading a valid {docLink}.`,
    "captures.main.message2.docLink": `catalog spec`,
    "captures.main.message2.docPath": `https://docs.estuary.dev/concepts/#catalogs`,
    "home.main.header": `Welcome to Control Plane!`,
    "home.main.description": `Click the Capture link over on the side navigation to get started.`,
    "admin.main.message": `This will most likely be a smaller "sub app" where you can view logs, alerts, users, etc.`,
    "logs.main.message": `This is where we will show the logs for the system.`,
    "users.main.message": `This is where you will be able to manage your users... basically a little User CRUD UI.`
};

export default enUSMessages;