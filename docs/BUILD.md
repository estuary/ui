# Build Configuration

## Vite

Configuration lives in `vite.config.ts`. Key plugins:

| Plugin                 | Purpose                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `checker()`            | ESLint + TypeScript checks during dev server                                           |
| `circleDependency()`   | Fails the build on circular imports                                                    |
| `compression()`        | Gzip compression for production output                                                 |
| `nodePolyfills()`      | Polyfills for `buffer`, `path`, `process`, `stream` (needed by WASM and Supabase deps) |
| `sri()`                | Subresource Integrity hash generation                                                  |
| `viteTsconfigPaths()`  | Resolves `src/` path aliases from `tsconfig.json`                                      |
| `wasm()`               | WebAssembly module support for `@estuary/flow-web`                                     |
| `writeVersionToFile()` | Custom plugin — writes the git commit hash to `public/meta.json` at build time         |

**Target**: Determined by the `browserslist` config in `package.json`.
