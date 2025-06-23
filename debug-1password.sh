#!/bin/bash
# Debug 1Password CLI authentication

echo "🔍 1Password CLI Debug Tool"
echo ""

# Check current status
echo "📊 Current Status:"
echo "1Password CLI version: $(op --version 2>/dev/null || echo 'Not available')"
echo ""

# Check if already authenticated
echo "🔐 Authentication Check:"
if op account list >/dev/null 2>&1; then
    echo "✅ Already authenticated"
    echo "📋 Available accounts:"
    op account list
    echo ""
    echo "👤 Current user:"
    op whoami 2>/dev/null || echo "Unable to get user info"
    echo ""
    echo "🧪 Testing Mercury key access:"
    if op read "op://Claude-Code Tools/MERCURY_API_KEYS/mgmt_api_key" >/dev/null 2>&1; then
        echo "✅ Can access Mercury API keys"
    else
        echo "❌ Cannot access Mercury API keys"
        echo "🔧 Available vaults:"
        op vault list 2>/dev/null || echo "Cannot list vaults"
    fi
else
    echo "❌ Not authenticated"
    echo ""
    echo "🔧 Authentication Options:"
    echo ""
    echo "Option 1: Service Account Token"
    echo "  If you have a service account token:"
    echo "  export OP_SERVICE_ACCOUNT_TOKEN='your-token'"
    echo ""
    echo "Option 2: Manual Account Setup"
    echo "  op account add --address your-account.1password.com --email your-email"
    echo "  eval \$(op signin)"
    echo ""
    echo "Option 3: App Integration"
    echo "  1. Install 1Password desktop app"
    echo "  2. Enable CLI integration in app settings"
    echo "  3. Run: op signin"
    echo ""
    
    # Try to detect if service account token is available
    if [ -n "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
        echo "✅ Service account token detected in environment"
        echo "🧪 Testing service account access:"
        if op account list >/dev/null 2>&1; then
            echo "✅ Service account working"
        else
            echo "❌ Service account token invalid or expired"
        fi
    else
        echo "⚠️  No service account token in environment"
    fi
fi

echo ""
echo "🚀 Quick Setup Options:"
echo ""
echo "For automated setup (if you have service token):"
echo "  export OP_SERVICE_ACCOUNT_TOKEN='your-service-token'"
echo "  ./connect-mercury.sh"
echo ""
echo "For manual setup:"
echo "  ./debug-1password.sh --interactive"

# Interactive setup option
if [ "$1" = "--interactive" ]; then
    echo ""
    echo "🔧 Interactive Setup Mode"
    echo ""
    
    read -p "Do you want to add a 1Password account manually? (y/N): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your 1Password account address (e.g., company.1password.com): " address
        read -p "Enter your email address: " email
        
        if [ -n "$address" ] && [ -n "$email" ]; then
            echo ""
            echo "🔑 Adding account..."
            if op account add --address "$address" --email "$email"; then
                echo "✅ Account added successfully"
                echo ""
                echo "🔐 Now signing in..."
                eval $(op signin)
                
                if op account list >/dev/null 2>&1; then
                    echo "✅ Authentication successful!"
                    echo ""
                    echo "🧪 Testing Mercury key access..."
                    if op read "op://Claude-Code Tools/MERCURY_API_KEYS/mgmt_api_key" >/dev/null 2>&1; then
                        echo "✅ Mercury API keys accessible"
                        echo "🚀 Ready to run: ./connect-mercury.sh"
                    else
                        echo "❌ Cannot access Mercury API keys"
                        echo "🔧 Check vault permissions"
                    fi
                else
                    echo "❌ Authentication failed"
                fi
            else
                echo "❌ Failed to add account"
            fi
        else
            echo "❌ Account address and email are required"
        fi
    fi
    
    echo ""
    read -p "Do you have a service account token to set? (y/N): " token_response
    if [[ "$token_response" =~ ^[Yy]$ ]]; then
        echo ""
        read -s -p "🔑 Enter your service account token: " token
        echo ""
        
        if [ -n "$token" ]; then
            export OP_SERVICE_ACCOUNT_TOKEN="$token"
            echo "🧪 Testing service account..."
            
            if op account list >/dev/null 2>&1; then
                echo "✅ Service account token working!"
                echo "📝 To make permanent, add to your shell profile:"
                echo "   echo 'export OP_SERVICE_ACCOUNT_TOKEN=\"$token\"' >> ~/.bashrc"
                echo ""
                echo "🚀 Ready to run: ./connect-mercury.sh"
            else
                echo "❌ Service account token invalid"
            fi
        else
            echo "❌ No token provided"
        fi
    fi
fi