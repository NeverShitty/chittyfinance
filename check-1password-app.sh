#!/bin/bash
# Check 1Password app integration

echo "🖥️  1Password App Integration Check"
echo ""

# Check if app integration is available
echo "🔍 Checking for 1Password app integration..."

# Try to detect if on macOS, Windows, or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 Platform: macOS"
    echo "🔧 Touch ID should be enabled in 1Password app"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    echo "📱 Platform: Windows"
    echo "🔧 Windows Hello should be enabled in 1Password app"
else
    echo "📱 Platform: Linux"
    echo "🔧 System authentication should be enabled in 1Password app"
fi

echo ""
echo "📋 App Integration Setup Steps:"
echo "1. Open 1Password desktop app"
echo "2. Go to Settings → Security"
echo "3. Enable biometric/system authentication"
echo "4. Go to Settings → Developer (or Developer → Settings)"
echo "5. Enable 'Integrate with 1Password CLI'"
echo ""

# Try to sign in
echo "🔐 Attempting to sign in with app integration..."
if op signin 2>&1 | grep -q "Waiting for authentication"; then
    echo "✅ App integration detected - check your 1Password app for approval"
elif op signin 2>&1 | grep -q "No accounts configured"; then
    echo "❌ App integration not enabled or no accounts in app"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "- Make sure 1Password desktop app is running"
    echo "- Verify CLI integration is enabled in app settings"
    echo "- Try restarting both the app and terminal"
else
    # Might be already signed in
    if op account list >/dev/null 2>&1; then
        echo "✅ Already signed in!"
        echo ""
        echo "📋 Available accounts:"
        op account list
        echo ""
        echo "🧪 Testing Mercury API key access..."
        if op read "op://Claude-Code Tools/MERCURY_API_KEYS/mgmt_api_key" >/dev/null 2>&1; then
            echo "✅ Can access Mercury API keys!"
            echo "🚀 Ready to run: ./connect-mercury.sh"
        else
            echo "❌ Cannot access Mercury API keys"
            echo "💡 Possible issues:"
            echo "   - Wrong vault name (should be 'Claude-Code Tools')"
            echo "   - Missing permissions for the vault"
            echo "   - Keys don't exist in that path"
            echo ""
            echo "🔍 Available vaults:"
            op vault list 2>/dev/null || echo "Cannot list vaults"
        fi
    else
        echo "❌ Sign in failed"
    fi
fi