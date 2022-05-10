import { createContext, ReactNode, useContext } from 'react';
import { Stores } from 'stores/Repo';

interface Props {
    routeStoreKey: Stores;
    children: ReactNode | ReactNode[];
}

const RouteStoreContext = createContext<Stores>(Stores.EMPTY);

function RouteStoreProvider({ children, routeStoreKey }: Props) {
    return (
        <RouteStoreContext.Provider value={routeStoreKey}>
            {children}
        </RouteStoreContext.Provider>
    );
}

const useRouteStore = () => useContext(RouteStoreContext);

export { RouteStoreProvider, useRouteStore };
