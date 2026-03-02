# Build Configuration

## Vite

Configuration lives in `vite.config.ts`. Key plugins:

| Plugin                 | Purpose                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `checker()`            | ESLint + TypeScript checks during dev server                                           |
| `circleDependency()`   | Fails the build on circular imports                                                    |
| `compression()`        | Gzip compression for production output                                                 |
| `nodePolyfills()`      | Polyfills for `buffer`, `path`, `process`, `stream` (needed by WASM and Supabase deps) |
| `wasm()`               | WebAssembly module support for `@estuary/flow-web`                                     |
| `writeVersionToFile()` | Custom plugin — writes the git commit hash to `public/meta.json` at build time         |

**Target**: Determined by the `browserslist` config in `package.json`.

## Common Commands

```bash
npm start           # Dev server at localhost:3000 (runs license check first)
npm run preview     # Production build + local preview server
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier check
npm run format:fix  # Prettier auto-fix
npm run licenses    # Verify dependency licenses
```
