import { setupServer } from 'msw/node';

const server = setupServer();
// use to make sure the test server is getting hit
// server.events.on('request:start', ({ request }) => {
//     console.log('MSW intercepted:', request.method, request.url);
// });

export * from 'msw';
export { server };
