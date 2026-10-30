@echo off
echo Starting FoodBridge AI...
echo.
echo App will be available at: http://localhost:3000
echo.
echo Demo accounts:
echo   Admin:     admin@demo.com / demo1234
echo   Donor:     donor@demo.com / demo1234
echo   NGO:       ngo@demo.com   / demo1234
echo   Volunteer: volunteer@demo.com / demo1234
echo.
cd /d "%~dp0"
npx next dev --port 3000
