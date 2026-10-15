@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ==========================================
echo    混沌赤潮 · 发布网站
echo ==========================================
echo.

git add -A
git diff --cached --quiet
if %errorlevel%==0 (
    echo [提示] 没有检测到任何改动，网站已经是最新的，无需发布。
    echo.
    pause
    exit /b 0
)

git commit -m "update content"
echo.
echo 正在上传到 GitHub，请稍候……
echo.
git push
if %errorlevel%==0 (
    echo.
    echo [成功] 上传完成！
    echo 大约 1~2 分钟后，网站会自动更新为最新版本：
    echo     https://777dishonor.github.io/chaos-red-tide/
) else (
    echo.
    echo [失败] 上传没有成功。
    echo 请把上面的文字截图发给助手，由助手处理。
)
echo.
pause
