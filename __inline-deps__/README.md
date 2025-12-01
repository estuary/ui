# Background

Our previous solution of using `gitpkg.sh` app had an issue when it went down. Also, this is not the greatest solution as it _really_ trusts whoever runs this application. To replace that we decided to just copy in the code. This is temporary (started Q4 2025) so should be fine. We now basically do the same things a `gitpkg.sh` just manually. This is fine because `data-plane-gateway` does not change often.

# How to update data-plane-gateway

You will need to make sure you have the latest `data-plane-gateway` checked out locally

Then in the `UI` repo you need to run the command below. Make sure your path ends with a slash

```
npm run hack-in-dpg /...PATH_TO_REPO.../data-plane-gateway/
```

After that you should see a new tarball generated. You will need to update `package.json` to reference this file and clean up the old file.
