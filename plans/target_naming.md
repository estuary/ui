# Goal

Migrating target naming to the root and remove the older `source.targetNaming`

# Migration Approach

The server/db will handle a large migration to lift these settings properly. They are waiting on the UI to support the new spec setting. After that is done we will also need another round of UI changes to clean up the old stuff.

If you look for `TODO (target naming:post migration:[remove,update])` you will find several areas marked with work that needs done. This is mainly just straight removal - but some areas do specifically call out an update.

# Dashboard Scenarios

## Capture

Regression testing that:

- `create` is still working
- `edit` is still working

## Collection / Transformation

Regression testing that:

- `create` is still working

## Materialization

This is the bulk of testing since the feature mainly is just here.

### Create

Only use the new root `targetNaming` property.
Ensure we still check if a connector supports `targetNaming` before showing/setting
Show setting in `Advanced Options`

#### User tries to manually add binding/sourceCapture:

We want to make sure that we have the setting before anything is added. So we need to request the user give us this setting before we allow them to add any bindings/captures.

- Allow user to select collection/capture
- if `targetNaming` is missing
    - Show a modal pop up requesting the user provide a `targetNaming` strategy
- Add binding/sourceCapture to spec

#### User tries to `materialize` binding/sourceCapture:

- Same as above HOWEVER it will block the hydration of the page until the user provides the `targetNaming` setting for us

### Edit

There is not much special with edit - the steps are the same as create when it comes to interactions. However, since we can have the new and old setting together we have to pick one.

This is the matrix of outcomes - X means the task contains the property.

| `source.targetNaming` | Root `targetNaming` | Workflow Shown |
| --------------------- | ------------------- | -------------- |
|                       |                     | New            |
|                       | X                   | New            |
| X                     | X                   | New            |
| X                     |                     | Old            |

### Gotchas

There are two things that might trip people up.

1. When adding the new root `targetNaming` the old `source.targetNaming` will be populated during publication. This is handled by the backend and does not cause issues. This setting is ignored. However, a user might notice it being added.

2. If a user manually edits their spec during `create` or `edit` and reloads they can end up seeing a new workflow. Example - if a user is editing a task with both old `source.targetNaming` and root `targetNaming`, removes that setting, reloads - they will see only the old workflow. We do not "lock" the user into a workflow beyond what we see during hydration.
