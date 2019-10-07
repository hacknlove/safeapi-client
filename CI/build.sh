rm -r ./dist

set -e

npx jest ./src/

npx rollup -c

# npx jest ./CI/

git add ./dist/*

echo
echo
echo "************SUCCESS*****************"

echo "update version in package.json and do npm publish"
echo
echo
