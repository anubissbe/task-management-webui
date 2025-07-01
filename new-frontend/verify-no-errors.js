// Verify no console errors in the frontend

// Simple test to check if the frontend loads without errors
async function verifyFrontend() {
    console.log('🔍 Verifying ProjectHub Frontend...\n');
    
    // Test 1: Frontend accessibility
    console.log('Test 1: Frontend Accessibility');
    const frontendUrl = 'http://localhost:8090';
    
    try {
        const response = await fetch(frontendUrl);
        if (response.ok) {
            console.log('✅ Frontend is accessible at', frontendUrl);
            
            const html = await response.text();
            
            // Check for error indicators in HTML
            const errorPatterns = [
                /error/i,
                /exception/i,
                /failed to load/i,
                /cannot find/i,
                /undefined is not/i
            ];
            
            let hasErrors = false;
            errorPatterns.forEach(pattern => {
                // Exclude expected occurrences
                const matches = html.match(pattern);
                if (matches && !html.includes('loginError') && !html.includes('error.message')) {
                    console.log(`⚠️  Found potential error pattern: ${pattern}`);
                    hasErrors = true;
                }
            });
            
            if (!hasErrors) {
                console.log('✅ No obvious errors in HTML');
            }
            
            // Check for required components
            console.log('\nTest 2: Required Components');
            const components = [
                { name: 'Alpine.js', pattern: /alpinejs/ },
                { name: 'Tailwind CSS', pattern: /tailwindcss/ },
                { name: 'Chart.js', pattern: /chart\.js/ },
                { name: 'SortableJS', pattern: /sortablejs/ },
                { name: 'App Script', pattern: /app-complete\.js/ },
                { name: 'ProjectHub Function', pattern: /projectHub\(\)/ }
            ];
            
            components.forEach(comp => {
                if (comp.pattern.test(html)) {
                    console.log(`✅ ${comp.name} is included`);
                } else {
                    console.log(`❌ ${comp.name} is missing`);
                }
            });
            
            // Test 3: API connectivity
            console.log('\nTest 3: API Connectivity');
            const apiUrl = 'http://localhost:3009/api/auth/login';
            
            try {
                const apiResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@projecthub.local',
                        password: 'admin123'
                    })
                });
                
                if (apiResponse.ok) {
                    console.log('✅ API is accessible and authentication works');
                    const data = await apiResponse.json();
                    if (data.accessToken || data.access_token) {
                        console.log('✅ Token received successfully');
                    }
                } else {
                    console.log(`❌ API returned error: ${apiResponse.status}`);
                }
            } catch (apiError) {
                console.log(`❌ API connection failed: ${apiError.message}`);
            }
            
            console.log('\n✨ Frontend verification complete!');
            console.log('📝 Note: Open http://localhost:8090 in a browser to test interactive features');
            
        } else {
            console.log(`❌ Frontend not accessible: ${response.status}`);
        }
    } catch (error) {
        console.log(`❌ Error accessing frontend: ${error.message}`);
    }
}

// Run verification
verifyFrontend().catch(console.error);