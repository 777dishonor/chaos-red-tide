@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ==========================================
echo    混沌赤潮 · 发布网站
echo ==========================================
echo.
echo  提示：发布前建议先关掉本地预览窗口，避免文件冲突。
echo.

echo [1/3] 正在构建网站（约 1 分钟）...
echo.
call npm run build:pages
if errorlevel 1 (
    echo.
    echo [失败] 构建出错，请把上面的文字截图发给助手。
    pause
    exit /b 1
)

echo.
echo [2/3] 备份源码到 GitHub ...
git add -A
git diff --cached --quiet
if %errorlevel%==0 (
    echo （源码没有改动，跳过）
) else (
    git commit -m "update content"
    git push
)

echo.
echo [3/3] 上传网站到线上 ...
cd out
if exist .git rmdir /s /q .git
git init -b gh-pages -q
git add -A
git -c user.name="777dishonor" -c user.email="1072033329@qq.com" commit -q -m "deploy"
git remote add origin git@github.com:777dishonor/chaos-red-tide.git
git push -f origin gh-pages
cd ..

echo.
echo [完成] 大约 1~2 分钟后，网站自动更新为最新版本：
echo     https://777dishonor.github.io/chaos-red-tide/
echo.
pause
