@echo off
cd /d "c:\Users\py293\OneDrive\Desktop\Unfazed\frontend"
call node_modules\.bin\vite.cmd build > "c:\Users\py293\OneDrive\Desktop\Unfazed\build_result.txt" 2>&1
if %ERRORLEVEL% EQU 0 (
  echo BUILD_SUCCESS >> "c:\Users\py293\OneDrive\Desktop\Unfazed\build_result.txt"
) else (
  echo BUILD_FAILED_CODE_%ERRORLEVEL% >> "c:\Users\py293\OneDrive\Desktop\Unfazed\build_result.txt"
)
