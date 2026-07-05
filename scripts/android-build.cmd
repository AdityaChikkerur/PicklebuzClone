@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."

rem --- Detect JAVA_HOME ---
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\javac.exe" (
        goto :java_ok
    )
)

if exist "C:\Program Files\Android\Android Studio\jbr\bin\javac.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    goto :java_ok
)

for /d %%d in ("C:\Program Files\Eclipse Adoptium\jdk-*") do (
    if exist "%%d\bin\javac.exe" (
        set "JAVA_HOME=%%d"
    )
)
if defined JAVA_HOME goto :java_ok

for /d %%d in ("C:\Program Files\Java\jdk-*") do (
    if exist "%%d\bin\javac.exe" (
        set "JAVA_HOME=%%d"
    )
)
if defined JAVA_HOME goto :java_ok

if exist "C:\Program Files\Java\latest\bin\javac.exe" (
    set "JAVA_HOME=C:\Program Files\Java\latest"
    goto :java_ok
)

:java_ok

rem --- Detect ANDROID_HOME ---
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%\platform-tools" (
        goto :android_ok
    )
)

if exist "C:\Users\%USERNAME%\AppData\Local\Android\Sdk\platform-tools" (
    set "ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
    goto :android_ok
)

if exist "C:\Users\Aditya Chikkerur\AppData\Local\Android\Sdk\platform-tools" (
    set "ANDROID_HOME=C:\Users\Aditya Chikkerur\AppData\Local\Android\Sdk"
    goto :android_ok
)

if exist "C:\Android\Sdk\platform-tools" (
    set "ANDROID_HOME=C:\Android\Sdk"
    goto :android_ok
)

:android_ok

rem --- Verify configuration ---
if not defined JAVA_HOME (
    echo [ERROR] JAVA_HOME is not set and could not be detected.
    echo Please install Java JDK 17+ and set the JAVA_HOME environment variable.
    exit /b 1
)

if not defined ANDROID_HOME (
    echo [ERROR] ANDROID_HOME is not set and could not be detected.
    echo Please install Android Studio/Android SDK and set the ANDROID_HOME environment variable.
    exit /b 1
)

echo Using JAVA_HOME: %JAVA_HOME%
echo Using ANDROID_HOME: %ANDROID_HOME%

set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"
if defined ANDROID_SDK_ROOT set "ANDROID_SDK_ROOT="

cd /d "%ROOT_DIR%\android"
call gradlew.bat %*

