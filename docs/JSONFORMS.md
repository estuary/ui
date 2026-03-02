# JSON Forms

## Form Generation Pipeline

1. Take connector JSON schema
2. Dereference `$ref` pointers
3. Generate UI schema in `src/services/jsonforms/index.ts` (~28KB of logic)
4. Apply custom renderers for special fields (OAuth, Duration, Discriminator, DataPlane)
5. Bind to Zustand store data

---

## Custom Connector Schema Annotations

Defined in `src/types/jsonforms.ts`. These annotations are added by connectors to their JSON schemas to opt into special rendering behavior:

| Annotation       | Effect                                      |
| ---------------- | ------------------------------------------- |
| `secret`         | Renders as a password/token field           |
| `airbyte_secret` | Airbyte-specific secret field               |
| `advanced`       | Grouped under an "advanced options" section |
| `multiline`      | Renders as a textarea                       |
| `discriminator`  | Marks the field as a OneOf variant selector |

---

## Custom Renderers

Located in `src/forms/renderers/`:

- **Nullable types** — adds a checkbox to opt into a `null` value
- **OAuth** — button that triggers an OAuth flow with backend token exchange
- **Duration** — ISO 8601 interval autocomplete with special UX handling
- **Discriminator** — handles OneOf selection even when encrypted fields break schema validation

---

## Validation

AJV with custom annotation support is configured in `src/services/ajv.ts`.

---

## Known Gotchas

### Encrypted fields break discriminator matching

When a discriminator field's sibling fields are encrypted, the OneOf schema validation fails because the encrypted values do not match the expected literal types. The workaround is in `src/forms/shared.ts`: match the discriminator by its value alone, ignoring the sibling fields. Do not rely on standard AJV discriminator validation for these cases.
