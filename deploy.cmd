@echo off
echo Installing dependencies...
call npm install --production

echo Building TypeScript...
call npm run build

echo Deployment complete!
