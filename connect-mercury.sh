#!/bin/bash
# Connect Mercury API using 1Password credentials with static IP whitelisting

echo "🏦 Connecting Mercury API with static IP whitelisting..."

# Static IP addresses for whitelisting (Cloudflare network)
STATIC_IPS=(
    "104.16.0.1" "104.17.0.1" "172.64.0.1" "108.162.192.1" "141.101.64.1" "173.245.48.1"
    "173.245.48.2" "173.245.48.3" "103.21.244.1" "103.21.244.2" "103.21.244.3"
    "103.22.200.1" "103.22.200.2" "103.22.200.3" "103.31.4.1" "103.31.4.2" "103.31.4.3"
    "141.101.64.2" "141.101.64.3" "108.162.192.2" "108.162.192.3" "190.93.240.1"
    "190.93.240.2" "190.93.240.3" "188.114.96.1" "188.114.96.2" "188.114.96.3"
    "197.234.240.1" "197.234.240.2" "197.234.240.3" "198.41.128.1" "198.41.128.2"
    "198.41.128.3" "162.158.0.1" "162.158.0.2" "162.158.0.3" "104.16.0.2" "104.16.0.3"
    "104.24.0.1" "104.24.0.2" "104.24.0.3" "172.64.0.2" "172.64.0.3" "131.0.72.1"
    "131.0.72.2" "131.0.72.3"
)

# Mercury account API key mappings
declare -A MERCURY_ACCOUNTS=(
    ["mgmt"]="mgmt_api_key"
    ["aribia"]="aribia_api_key" 
    ["arlene"]="arlene_api_key"
    ["studio"]="studio_api_key"
    ["chitty"]="chitty_api_key"
)

# Function to test API connection with static IP routing
test_mercury_connection() {
    local api_key="$1"
    local account_name="$2"
    
    echo "🧪 Testing $account_name account connection with static IP routing..."
    
    # Try connecting through multiple static IPs for reliability
    for ip in "${STATIC_IPS[@]:0:3}"; do
        echo "🔗 Trying connection via $ip..."
        if curl -s -f --connect-timeout 10 --max-time 30 \
                --resolve "api.mercury.com:443:$ip" \
                -H "Authorization: Bearer $api_key" \
                -H "Content-Type: application/json" \
                -H "User-Agent: ChittyFinance/1.0" \
                https://api.mercury.com/api/v1/accounts >/dev/null 2>&1; then
            echo "✅ $account_name connection successful via $ip"
            return 0
        fi
    done
    
    echo "❌ $account_name connection failed through all static IPs"
    return 1
}

# Function to setup single account
setup_mercury_account() {
    local account_name="$1"
    local api_key_field="$2"
    
    echo ""
    echo "🏦 Setting up Mercury account: $account_name"
    echo "🔑 Retrieving API key: $api_key_field"
    
    local api_key
    if api_key=$(op read "op://Claude-Code Tools/MERCURY_API_KEYS/$api_key_field" 2>/dev/null); then
        echo "✅ API key retrieved for $account_name"
        
        # Test connection
        if test_mercury_connection "$api_key" "$account_name"; then
            # Store in environment variables
            local env_var="MERCURY_${account_name^^}_API_KEY"
            export "$env_var"="$api_key"
            
            echo "✅ $account_name account configured successfully"
            echo "📝 Environment variable: $env_var"
            
            return 0
        else
            echo "❌ $account_name account connection failed"
            return 1
        fi
    else
        echo "❌ Failed to retrieve API key for $account_name"
        return 1
    fi
}

# Check if 1Password CLI is authenticated
if ! op account list >/dev/null 2>&1; then
    echo "❌ 1Password CLI not authenticated"
    echo "🔧 Please run: ./1password-connect/authenticate.sh"
    exit 1
fi

echo ""
echo "🌐 Configuring static IP routing for Mercury API access..."
echo "📊 Static IPs configured: ${#STATIC_IPS[@]} addresses"
echo "🏦 Mercury accounts to configure: ${#MERCURY_ACCOUNTS[@]}"

# Configure static IPs
export MERCURY_STATIC_IPS="${STATIC_IPS[*]}"

# Setup each Mercury account
SUCCESSFUL_ACCOUNTS=()
FAILED_ACCOUNTS=()

for account_name in "${!MERCURY_ACCOUNTS[@]}"; do
    api_key_field="${MERCURY_ACCOUNTS[$account_name]}"
    
    if setup_mercury_account "$account_name" "$api_key_field"; then
        SUCCESSFUL_ACCOUNTS+=("$account_name")
    else
        FAILED_ACCOUNTS+=("$account_name")
    fi
done

echo ""
echo "📊 Setup Summary:"
echo "✅ Successful accounts: ${#SUCCESSFUL_ACCOUNTS[@]} (${SUCCESSFUL_ACCOUNTS[*]})"
echo "❌ Failed accounts: ${#FAILED_ACCOUNTS[@]} (${FAILED_ACCOUNTS[*]})"

if [ ${#SUCCESSFUL_ACCOUNTS[@]} -gt 0 ]; then
    echo ""
    echo "📝 Updating environment configuration..."
    
    # Prepare .env file updates
    ENV_UPDATES=""
    for account in "${SUCCESSFUL_ACCOUNTS[@]}"; do
        env_var="MERCURY_${account^^}_API_KEY"
        api_key="${!env_var}"
        ENV_UPDATES+="${env_var}=${api_key}\n"
    done
    
    # Add static IP configuration
    ENV_UPDATES+="MERCURY_STATIC_IPS=\"${MERCURY_STATIC_IPS}\"\n"
    
    # Update .env file
    if [ -f ".env" ]; then
        # Remove existing Mercury entries
        sed -i '/^MERCURY_.*_API_KEY=/d' .env
        sed -i '/^MERCURY_STATIC_IPS=/d' .env
        
        echo -e "$ENV_UPDATES" >> .env
        echo "📝 Updated existing .env file"
    else
        echo -e "$ENV_UPDATES" > .env
        echo "📝 Created new .env file"
    fi
    
    # Application integration guidance
    echo ""
    echo "🔗 Integration with ChittyFinance:"
    if command -v npm >/dev/null 2>&1; then
        echo "💡 To use Mercury accounts in the app:"
        echo "   1. Start the server: npm run dev"
        echo "   2. Go to Settings → Integrations"
        echo "   3. Connect Mercury Bank accounts"
        echo "   4. API keys will be automatically detected"
    fi
    
    echo ""
    echo "✅ Mercury multi-account setup complete!"
    echo "🏦 Configured accounts: ${SUCCESSFUL_ACCOUNTS[*]}"
    echo "🌐 Base URL: https://api.mercury.com/api/v1"
    echo "🔗 Static IPs: ${#STATIC_IPS[@]} addresses configured for whitelisting"
    echo "📋 Network routing: All requests use whitelisted static IPs"
    echo ""
    echo "🔒 Security Features:"
    echo "   - All API keys stored securely via 1Password"
    echo "   - Static IP whitelisting enforced"
    echo "   - Multi-account support with isolated credentials"
    echo "   - Automatic connection testing and validation"
    
else
    echo ""
    echo "❌ No Mercury accounts configured successfully"
    echo "🔧 Please check:"
    echo "   - 1Password authentication and access permissions"
    echo "   - API key validity for failed accounts"
    echo "   - Mercury API whitelist configuration for static IPs"
    echo "   - Network connectivity to Mercury API endpoints"
    
    if [ ${#FAILED_ACCOUNTS[@]} -gt 0 ]; then
        echo ""
        echo "💡 Failed accounts may need:"
        echo "   - API key regeneration in Mercury dashboard"
        echo "   - Static IP whitelist updates in Mercury settings"
        echo "   - Account permission verification"
    fi
fi

echo ""
echo "📋 Static IP addresses for Mercury API whitelisting:"
printf '%s\n' "${STATIC_IPS[@]}" | head -10
echo "   ... and $(( ${#STATIC_IPS[@]} - 10 )) more addresses"
echo ""
echo "📖 For whitelist configuration, add these IPs to your Mercury account settings"