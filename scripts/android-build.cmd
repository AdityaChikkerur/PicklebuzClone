@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
set "ANDROID_HOME=C:\Users\AJINKYA\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Java\jdk-23"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"
if defined ANDROID_SDK_ROOT set "ANDROID_SDK_ROOT="
cd /d "%ROOT_DIR%\android"
call gradlew.bat %*
