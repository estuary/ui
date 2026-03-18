#!/bin/bash

# URL of the tarball to download
TARBALL_URL="https://github.com/estuary/flow/releases/download/dev-next/estuary-flow-web.tgz"

# Destination directory
DEST_DIR="__inline-deps__"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Generate timestamp and create filename
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
TARBALL_NAME="estuary-flow-web-${TIMESTAMP}.tgz"

# Download the tarball
echo "Downloading $TARBALL_URL..."
curl -L -o "$DEST_DIR/$TARBALL_NAME" "$TARBALL_URL"

if [ $? -ne 0 ]; then
    echo "Error: Failed to download tarball"
    exit 1
fi

echo "COMPLETE: $DEST_DIR/$TARBALL_NAME"
