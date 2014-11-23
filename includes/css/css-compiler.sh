#!/bin/bash

# Compile all less files into css
#for i in *.less; do
#  printf "$i\n"
  # Get the file name without extension
#  filename="${i%.*}"
  # Call the less compiler
#  lessc $i > "${filename}.css"
#done

# Store previous directory
OLD_DIR=`pwd`

# Get the current dir and switch to it
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "${DIR}"

# Compile the style sheets
lessc style.less > style.css

# Restore the old directory
cd "${OLD_DIR}"

exit 0 
