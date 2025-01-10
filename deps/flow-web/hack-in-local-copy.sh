#!/bin/bash

# Check if exactly one argument is passed
if [ $# -ne 1 ]; then
    echo "Please provide the path to flow (ex: /home/travis/code/flow)"
    exit 1
fi

# The directory path from the argument
SOURCE_DIR="$1/crates/flow-web/pkg/"

# Check if the directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: '$SOURCE_DIR' is not a valid directory."
    exit 1
fi

# Destination directory
DEST_DIR="node_modules/@estuary/flow-web"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy the directory to the destination
cp -r "$SOURCE_DIR"/* "$DEST_DIR"

echo "Directory '$SOURCE_DIR' has been copied to '$DEST_DIR'."

# Path to the directory to delete
DIR_TO_DELETE="node_modules/.vite/deps"

# Check if the directory exists, and delete it if it does
if [ -d "$DIR_TO_DELETE" ]; then
    rm -r "$DIR_TO_DELETE"
    echo "Directory '$DIR_TO_DELETE' has been deleted."
else
    echo "Directory '$DIR_TO_DELETE' does not exist."
fi