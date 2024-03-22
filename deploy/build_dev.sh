#!/bin/bash
start_time=$(date +%H:%M:%S)
start_time_s=$(date +%s)

# ================ ↓↓↓↓↓ Actual Script Content ↓↓↓↓↓ ================

git checkout dev
git pull
pnpm i

rm -rf dist

export NODE_OPTIONS='--max-old-space-size=12000'

npm run build:development # Normal build

# Backup build code
rm -rf dist/.DS_Store
mkdir -p dist-records-dev
cp -rf dist dist-records-dev/dist_$(date '+%Y-%m-%d_%H.%M.%S')

# ================ ↑↑↑↑↑ Actual Script Content ↑↑↑↑↑ ================

end_time=$(date +%H:%M:%S)
end_time_s=$(date +%s)
spend=$(($end_time_s - $start_time_s))
spend_min=$(($spend / 60))
echo ''
echo "$start_time -> $end_time" "Total: $spend seconds ($spend_min mins)"
echo ''