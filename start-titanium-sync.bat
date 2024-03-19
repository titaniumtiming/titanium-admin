@echo off

setlocal




REM Set the repository URL and project directory
set repo_url=https://github.com/DawidWraga/titanium-admin.git
set project_dir=%USERPROFILE%\titanium-admin

REM Check if the project directory exists
if exist "%project_dir%" (
  echo Project directory already exists.
) else (
  echo Cloning the project from GitHub...
  git clone "%repo_url%" "%project_dir%"
)

REM Change to the project directory
cd "%project_dir%"

:checkEnvFile
REM Check for the existence of .env file
if exist ".env" (
  echo .env file found.
) else (
  echo ⚠️ ERROR: .env file is missing in the project root.
  echo Cloning .env.example to .env...
  copy .env.example .env
  echo .env file created from .env.example.
  echo Opening .env file in the default editor...
  start .env
  echo Please ensure you have a .env file with all the required environment variables.
  echo Press any key once .env file is ready...
  pause > nul
  goto checkEnvFile
)


REM Check if the project has already been built
if exist ".next" (
  echo Project is already built, skipping build step.
  @REM pause > nul
) else (

  echo Project is not built. Must install and build the project.
  echo press enter to install
  pause > nul
  cd "%project_dir%" && pnpm install
  echo Project is installed
  pwd
  echo press enter to build
  pause > nul
  cd "%project_dir%" && pnpm run build
  echo Current working directory: %cd%
  echo Project is built

  REM Print the current working directory

  pause > nul
  
)

REM Start the Next.js app
echo Starting the Next.js app...

@REM pause > nul

start ""  http://localhost:3000


cmd /c pnpm run start



pause > nul

