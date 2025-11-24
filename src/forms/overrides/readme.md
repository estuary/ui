# What is this?

These are renderers where we are just adding different default functionality that JSONForms does not provide. This stay in their own folder just to make it clear that these should stay REALLY close to the originals.

We follow JSONForm's folder structure to make it easier to bring over updates and know where stuff came from. We also disable certain linting rules for this folder so that we don't have to alter their code anymore than we need to.

# Why is content hardcoded?

We implemented this before JSONForms started adding i18n support. So now we can start getting content plumbed through from `react-intl` soon.

# How do they stay in sync?

We have to check after every JSONForms update if these need updated. This is usually a manual process that happens along with updating the JSONForms version.

# Potential Future Customizations

1. Allow anchor tags to be rendered in forms
2. Show description for array
3. Selecting multiple values from array displaying as tag list
