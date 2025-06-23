#!/bin/bash
# Direct Mercury API setup - bypassing 1Password for now

echo "🏦 Direct Mercury API Setup"
echo ""

# You'll need to paste your API keys here temporarily
# Remove this file when done for security!

# Mercury API Keys - PASTE YOUR KEYS HERE
MERCURY_MGMT_API_KEY=""
MERCURY_ARIBIA_API_KEY=""
MERCURY_ARLENE_API_KEY=""
MERCURY_STUDIO_API_KEY=""
MERCURY_CHITTY_API_KEY=""

# Static IPs for whitelisting
MERCURY_STATIC_IPS="104.16.0.1 104.17.0.1 172.64.0.1 108.162.192.1 141.101.64.1"

# Quick test function
test_api_key() {
    local key="$1"
    local name="$2"
    
    if [ -z "$key" ]; then
        echo "❌ $name: No API key provided"
        return 1
    fi
    
    echo "🧪 Testing $name..."
    if curl -s -f -H "Authorization: Bearer $key" https://api.mercury.com/api/v1/accounts >/dev/null 2>&1; then
        echo "✅ $name: API key works!"
        return 0
    else
        echo "❌ $name: API key failed"
        return 1
    fi
}

echo "📋 Instructions:"
echo "1. Edit this file and paste your Mercury API keys"
echo "2. Run this script to test them"
echo "3. Delete this file when done (for security)"
echo ""

if [ -z "$MERCURY_MGMT_API_KEY" ]; then
    echo "⚠️  No API keys configured yet"
    echo "📝 Edit $0 and add your keys"
    exit 1
fi

echo "🔍 Testing Mercury API keys..."
echo ""

# Test each key
test_api_key "$MERCURY_MGMT_API_KEY" "Management"
test_api_key "$MERCURY_ARIBIA_API_KEY" "Aribia"
test_api_key "$MERCURY_ARLENE_API_KEY" "Arlene"
test_api_key "$MERCURY_STUDIO_API_KEY" "Studio"
test_api_key "$MERCURY_CHITTY_API_KEY" "Chitty"

echo ""
echo "📝 Creating .env file..."

cat > .env << EOF
# Mercury API Keys
MERCURY_MGMT_API_KEY=$MERCURY_MGMT_API_KEY
MERCURY_ARIBIA_API_KEY=$MERCURY_ARIBIA_API_KEY
MERCURY_ARLENE_API_KEY=$MERCURY_ARLENE_API_KEY
MERCURY_STUDIO_API_KEY=$MERCURY_STUDIO_API_KEY
MERCURY_CHITTY_API_KEY=$MERCURY_CHITTY_API_KEY
MERCURY_STATIC_IPS="$MERCURY_STATIC_IPS"
EOF

echo "✅ .env file created"
echo ""
echo "🚀 Mercury API setup complete!"
echo "💡 Next: npm run dev (to start the app)"
echo ""
echo "⚠️  SECURITY REMINDER: Delete this file after use!"
echo "   rm $0"