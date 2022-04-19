import { Collections } from '@mui/icons-material';
import AppLayout from 'AppLayout';
import CaptureCreate from 'components/capture/create';
import CaptureEdit from 'components/capture/edit';
import NewMaterialization from 'components/materialization/create';
import Admin from 'pages/Admin';
import Builds from 'pages/Builds';
import Captures from 'pages/Captures';
import PageNotFound from 'pages/error/PageNotFound';
import Home from 'pages/Home';
import Materializations from 'pages/Materializations';
import { Route, Routes } from 'react-router';

export const routeDetails = {
    admin: {
        title: 'routeTitle.admin',
        path: '/admin',
    },
    builds: {
        title: 'routeTitle.builds',
        path: '/test/builds',
    },
    capture: {
        root: '/capture',
        create: {
            title: 'routeTitle.captureCreate',
            path: `create`,
            fullPath: '/capture/create',
        },
        edit: {
            title: 'routeTitle.captureEdit',
            path: 'edit',
            fullPath: '/capture/edit',
        },
    },
    captures: {
        title: 'routeTitle.captures',
        path: '/captures',
    },
    collections: {
        title: 'routeTitle.collections',
        path: '/collections',
    },
    home: {
        title: 'routeTitle.dashboard',
        path: '/',
    },
    materialization: {
        root: '/materialization',
        create: {
            title: 'routeTitle.materializationCreate',
            path: 'create',
        },
    },
    materializations: {
        title: 'routeTitle.materializations',
        path: '/materializations',
    },
    pageNotFound: {
        title: 'routeTitle.error.pageNotFound',
        path: '*',
    },
};

const Authenticated = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path={routeDetails.home.path} element={<Home />} />
                <Route path={routeDetails.builds.path} element={<Builds />} />
                <Route
                    path={routeDetails.collections.path}
                    element={<Collections />}
                />

                <Route
                    path={routeDetails.captures.path}
                    element={<Captures />}
                />
                <Route path={routeDetails.capture.root}>
                    <Route
                        path={routeDetails.capture.create.path}
                        element={<CaptureCreate />}
                    />
                    <Route
                        path={routeDetails.capture.edit.path}
                        element={<CaptureEdit />}
                    />
                </Route>

                <Route
                    path={routeDetails.materializations.path}
                    element={<Materializations />}
                />
                <Route path={routeDetails.materialization.root}>
                    <Route
                        path={routeDetails.materialization.create.path}
                        element={<NewMaterialization />}
                    />
                </Route>

                <Route path={routeDetails.admin.path} element={<Admin />} />
                <Route
                    path={routeDetails.pageNotFound.path}
                    element={<PageNotFound />}
                />
            </Route>
        </Routes>
    );
};

export default Authenticated;
