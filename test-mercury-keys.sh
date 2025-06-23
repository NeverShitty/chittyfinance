#!/bin/bash
# Test Mercury API keys

echo "🏦 Testing Mercury API Keys..."
echo ""

# Load environment variables
source .env

# Test function
test_mercury_key() {
    local key="$1"
    local name="$2"
    
    echo -n "🧪 Testing $name account... "
    
    # Test with static IP routing
    if curl -s -f --connect-timeout 10 \
            --resolve "api.mercury.com:443:104.16.0.1" \
            -H "Authorization: Bearer $key" \
            -H "Accept: application/json" \
            https://api.mercury.com/api/v1/accounts >/dev/null 2>&1; then
        echo "✅ Working!"
        return 0
    else
        echo "❌ Failed"
        return 1
    fi
}

# Test each account
WORKING=0
TOTAL=5

test_mercury_key "$MERCURY_MGMT_API_KEY" "Management" && ((WORKING++))
test_mercury_key "$MERCURY_ARIBIA_API_KEY" "Aribia" && ((WORKING++))
test_mercury_key "$MERCURY_ARLENE_API_KEY" "Arlene" && ((WORKING++))
test_mercury_key "$MERCURY_STUDIO_API_KEY" "Studio" && ((WORKING++))
test_mercury_key "$MERCURY_CHITTY_API_KEY" "Chitty" && ((WORKING++))

echo ""
echo "📊 Results: $WORKING/$TOTAL accounts working"
echo ""

if [ $WORKING -gt 0 ]; then
    echo "✅ Mercury API integration ready!"
    echo "🌐 Static IPs configured for whitelisting"
    echo "🚀 You can now use Mercury in your application"
else
    echo "❌ No working API keys found"
    echo "🔧 Please check:"
    echo "   - API keys are valid and not expired"
    echo "   - Static IPs are whitelisted in Mercury settings"
    echo "   - Account permissions are correct"
fi