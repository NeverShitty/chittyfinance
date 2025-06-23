#!/bin/bash
# Interactive Mercury API key setup

echo "🏦 Mercury API Key Setup Helper"
echo ""
echo "📋 Please have your Mercury API keys ready from:"
echo "   https://share.1password.com/s#ZbJ1gxqeRUOR_5K5-Arb0mVLoIoQPlbqjhNHsEjaDJo"
echo ""

# Function to read key with masking
read_api_key() {
    local prompt="$1"
    local var_name="$2"
    
    echo -n "$prompt: "
    read -s api_key
    echo ""
    
    if [ -n "$api_key" ]; then
        eval "$var_name='$api_key'"
        echo "✅ Set (${#api_key} characters)"
        return 0
    else
        echo "⏭️  Skipped"
        return 1
    fi
}

echo "🔑 Enter your Mercury API keys (they will be hidden):"
echo ""

# Collect API keys
read_api_key "Management API Key" MERCURY_MGMT_API_KEY
read_api_key "Aribia API Key" MERCURY_ARIBIA_API_KEY
read_api_key "Arlene API Key" MERCURY_ARLENE_API_KEY
read_api_key "Studio API Key" MERCURY_STUDIO_API_KEY
read_api_key "Chitty API Key" MERCURY_CHITTY_API_KEY

echo ""
echo "🧪 Testing API keys..."
echo ""

# Test function
test_key() {
    local key="$1"
    local name="$2"
    
    if [ -z "$key" ]; then
        return 1
    fi
    
    echo -n "Testing $name... "
    if curl -s -f -H "Authorization: Bearer $key" https://api.mercury.com/api/v1/accounts >/dev/null 2>&1; then
        echo "✅ Working!"
        return 0
    else
        echo "❌ Failed"
        return 1
    fi
}

# Test each key
WORKING_KEYS=0
test_key "$MERCURY_MGMT_API_KEY" "Management" && ((WORKING_KEYS++))
test_key "$MERCURY_ARIBIA_API_KEY" "Aribia" && ((WORKING_KEYS++))
test_key "$MERCURY_ARLENE_API_KEY" "Arlene" && ((WORKING_KEYS++))
test_key "$MERCURY_STUDIO_API_KEY" "Studio" && ((WORKING_KEYS++))
test_key "$MERCURY_CHITTY_API_KEY" "Chitty" && ((WORKING_KEYS++))

echo ""
echo "📊 Results: $WORKING_KEYS working keys"

if [ $WORKING_KEYS -gt 0 ]; then
    echo ""
    echo "📝 Creating .env file..."
    
    # Create .env file
    cat > .env << EOF
# Mercury API Keys
MERCURY_MGMT_API_KEY=$MERCURY_MGMT_API_KEY
MERCURY_ARIBIA_API_KEY=$MERCURY_ARIBIA_API_KEY
MERCURY_ARLENE_API_KEY=$MERCURY_ARLENE_API_KEY
MERCURY_STUDIO_API_KEY=$MERCURY_STUDIO_API_KEY
MERCURY_CHITTY_API_KEY=$MERCURY_CHITTY_API_KEY

# Static IP Configuration
MERCURY_STATIC_IPS="104.16.0.1 104.17.0.1 172.64.0.1 108.162.192.1 141.101.64.1"
EOF
    
    echo "✅ .env file created with $WORKING_KEYS API keys"
    echo ""
    echo "🚀 Mercury setup complete!"
    echo "💡 You can now use Mercury in your application"
else
    echo ""
    echo "❌ No working API keys found"
    echo "🔧 Please check your API keys and try again"
fi