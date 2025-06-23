#!/bin/bash
# Setup 1Password Connect client

echo "🔐 1Password Connect Server Client Setup"
echo ""

# Check if Connect server is running
echo "🔍 Checking for local Connect server..."
if curl -s -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Connect server is running on port 8080"
elif curl -s -f http://localhost:8081/health >/dev/null 2>&1; then
    echo "✅ Connect server is running on port 8081"
    export OP_CONNECT_HOST="http://localhost:8081"
else
    echo "❌ No Connect server detected on localhost:8080 or 8081"
fi

echo ""
echo "📋 Connect Server Configuration"
echo ""

# Check if token is already set
if [ -n "$OP_CONNECT_TOKEN" ]; then
    echo "✅ Connect token already set in environment"
    echo "🧪 Testing connection..."
    
    if op vault list >/dev/null 2>&1; then
        echo "✅ Connected to 1Password Connect server!"
        echo ""
        echo "📋 Available vaults:"
        op vault list
        echo ""
        echo "🧪 Testing Mercury API keys access..."
        if op read "op://Claude-Code Tools/MERCURY_API_KEYS/mgmt_api_key" >/dev/null 2>&1; then
            echo "✅ Mercury API keys accessible!"
            echo "🚀 Ready to run: ./connect-mercury.sh"
        else
            echo "❌ Cannot access Mercury API keys"
            echo "💡 Check vault name and permissions"
        fi
    else
        echo "❌ Connection failed - check token validity"
    fi
else
    echo "❌ No Connect token found"
    echo ""
    echo "🔧 To configure:"
    echo "1. Get your Connect token from the server setup"
    echo "2. Set environment variables:"
    echo ""
    echo "   export OP_CONNECT_HOST=\"http://localhost:8080\""
    echo "   export OP_CONNECT_TOKEN=\"your-connect-token\""
    echo ""
    echo "3. Run this script again to test"
    echo ""
    
    # Interactive setup
    read -p "Do you have your Connect token? (y/N): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo ""
        read -s -p "🔑 Enter your Connect token: " token
        echo ""
        
        if [ -n "$token" ]; then
            export OP_CONNECT_HOST="${OP_CONNECT_HOST:-http://localhost:8080}"
            export OP_CONNECT_TOKEN="$token"
            
            echo "🧪 Testing connection..."
            if op vault list >/dev/null 2>&1; then
                echo "✅ Successfully connected to Connect server!"
                echo ""
                echo "📝 To make permanent, add to .env:"
                echo "   echo 'export OP_CONNECT_HOST=\"$OP_CONNECT_HOST\"' >> .env"
                echo "   echo 'export OP_CONNECT_TOKEN=\"$token\"' >> .env"
                echo ""
                echo "🚀 Now run: ./connect-mercury.sh"
            else
                echo "❌ Connection failed"
                echo "🔧 Please verify:"
                echo "   - Connect server is running"
                echo "   - Token is correct"
                echo "   - Server URL is correct"
            fi
        fi
    fi
fi