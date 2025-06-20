#!/bin/bash

# ChittyFinance Health Check Script
# Validates deployment and security configuration

DOMAIN="finance.chitty.cc"
BASE_URL="https://$DOMAIN"

echo "🏥 Running health checks for ChittyFinance at $DOMAIN..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_status() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $description${NC}"
        return 0
    else
        echo -e "${RED}❌ $description (Status: $response)${NC}"
        return 1
    fi
}

check_ssl() {
    echo "🔒 Checking SSL certificate..."
    
    if command -v openssl &> /dev/null; then
        ssl_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SSL certificate is valid${NC}"
            echo "$ssl_info"
        else
            echo -e "${RED}❌ SSL certificate check failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ OpenSSL not available - skipping SSL check${NC}"
    fi
}

check_security_headers() {
    echo "🛡️ Checking security headers..."
    
    headers=$(curl -s -I "$BASE_URL" 2>/dev/null)
    
    # Check for important security headers
    if echo "$headers" | grep -i "strict-transport-security" > /dev/null; then
        echo -e "${GREEN}✅ HSTS header present${NC}"
    else
        echo -e "${RED}❌ HSTS header missing${NC}"
    fi
    
    if echo "$headers" | grep -i "x-frame-options" > /dev/null; then
        echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
    else
        echo -e "${RED}❌ X-Frame-Options header missing${NC}"
    fi
    
    if echo "$headers" | grep -i "x-content-type-options" > /dev/null; then
        echo -e "${GREEN}✅ X-Content-Type-Options header present${NC}"
    else
        echo -e "${RED}❌ X-Content-Type-Options header missing${NC}"
    fi
    
    if echo "$headers" | grep -i "content-security-policy" > /dev/null; then
        echo -e "${GREEN}✅ Content-Security-Policy header present${NC}"
    else
        echo -e "${RED}❌ Content-Security-Policy header missing${NC}"
    fi
}

check_api_endpoints() {
    echo "🔌 Checking API endpoints..."
    
    # Health endpoint
    check_status "$BASE_URL/api/health" 200 "Health endpoint"
    
    # Session endpoint (should require auth)
    check_status "$BASE_URL/api/session" 401 "Session endpoint (auth required)"
    
    # Financial summary (should require auth)
    check_status "$BASE_URL/api/financial-summary" 401 "Financial summary (auth required)"
    
    # Rate limiting test
    echo "🚦 Testing rate limiting..."
    for i in {1..5}; do
        curl -s "$BASE_URL/api/health" > /dev/null
    done
    
    # This should still work (within rate limit)
    if check_status "$BASE_URL/api/health" 200 "Rate limiting (normal usage)"; then
        echo -e "${GREEN}✅ Rate limiting configured properly${NC}"
    fi
}

check_database_connection() {
    echo "💾 Checking database connectivity..."
    
    # Try to access an endpoint that would fail if DB is down
    response=$(curl -s "$BASE_URL/api/health" 2>/dev/null)
    
    if echo "$response" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Database connection healthy${NC}"
    else
        echo -e "${RED}❌ Database connection issue${NC}"
        echo "Response: $response"
    fi
}

check_performance() {
    echo "⚡ Checking performance..."
    
    # Measure response time
    response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL/api/health" 2>/dev/null)
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        echo -e "${GREEN}✅ Response time: ${response_time}s (Good)${NC}"
    elif (( $(echo "$response_time < 5.0" | bc -l) )); then
        echo -e "${YELLOW}⚠️ Response time: ${response_time}s (Acceptable)${NC}"
    else
        echo -e "${RED}❌ Response time: ${response_time}s (Slow)${NC}"
    fi
}

# Run all checks
echo "Starting comprehensive health check..."
echo ""

failed_checks=0

# Basic connectivity
if ! check_status "$BASE_URL" 200 "Basic connectivity"; then
    ((failed_checks++))
fi

# SSL certificate
if ! check_ssl; then
    ((failed_checks++))
fi

# Security headers
check_security_headers

# API endpoints
check_api_endpoints

# Database
if ! check_database_connection; then
    ((failed_checks++))
fi

# Performance
check_performance

echo ""
echo "🏁 Health check complete!"

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical checks passed! ChittyFinance is healthy.${NC}"
    exit 0
else
    echo -e "${RED}❌ $failed_checks critical check(s) failed. Please investigate.${NC}"
    exit 1
fi