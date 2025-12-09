#!/bin/bash
# Check if exactly one argument is passed
if [ $# -ne 1 ]; then
    echo "Please provide the path to data-plane-gateway (ex: /home/user/repos/data-plane-gateway/)"
    exit 1
fi

# The directory path from the argument
SOURCE_DIR="$1client/dist/"

# Check if the directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: '$SOURCE_DIR' is not a valid directory."
    exit 1
fi
# Destination directory
DEST_DIR="__inline-deps__/data-plane-gateway"

# Create the destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy the directory to the destination
cp -r "$SOURCE_DIR"/* "$DEST_DIR"
echo "Directory '$SOURCE_DIR' has been copied to '$DEST_DIR'."

# Change to destination directory and pack
cd "$DEST_DIR"
TARBALL=$(npm pack)
if [ $? -ne 0 ]; then
    echo "Error: npm pack failed"
    exit 1
fi
echo "Created tarball: $TARBALL"

# Generate timestamp and create new filename
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Extract base name and extension
TARBALL_BASE="${TARBALL%.tgz}"
TARBALL_TIMESTAMPED="${TARBALL_BASE}-${TIMESTAMP}.tgz"

# Rename tarball with timestamp
mv "$TARBALL" "$TARBALL_TIMESTAMPED"
TARBALL="$TARBALL_TIMESTAMPED"

# Move tarball to parent directory
mv "$TARBALL" ../

# Clean up the copied files (but keep the directory)
cd ../..
rm -rf "$DEST_DIR"/
echo "Cleaned up copied files from $DEST_DIR"

echo "COMPLETE: __inline-deps__/$TARBALL"