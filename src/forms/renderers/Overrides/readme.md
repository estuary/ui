# What is this?

These are renderers where we are just adding different default functionality that JSONForms does not provide. This stay in their own folder just to make it clear that these should stay REALLY close to the originals.

We follow JSONForm's folder structure to make it easier to bring over updates and know where stuff came from. We also disable certain linting rules for this folder so that we don't have to alter their code anymore than we need to.

# Why is content hardcoded?

Unlike other parts of the app these components have content hardcoded into them. This goes against our general approach to using React-Intl for all content in the UI. We did this is because we want these components to match JSON Forms closely and the content is not exactly "ours" to change right now. We want to keep the components all using the same content (as much as possible).

Eventually we need to put some time into how we want to handle JSON Forms translations - but can wait until we truly need translations.

# How do they stay in sync?

We have to check after every JSONForms update if these need updated.

# Current Customizations

1. A oneOf renderer for the parser format property

# Upcoming Customizations

1. Allow anchor tags to be rendered in forms
2. Show description for array
3. Selecting multiple values from array displaying as tag list
