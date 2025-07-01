// Fix Analytics View Script
// Run this in the browser console on ProjectHub

// Get app instance
let app = document.querySelector('[x-data]').__x.$data;

// Debug current state
console.log('=== Current State ===');
console.log('View:', app.currentView);
console.log('Projects:', app.projects.length);
console.log('Tasks:', app.tasks.length);
console.log('Analytics data:', app.analytics);

// Switch to analytics
app.currentView = 'analytics';

// Force calculate analytics
app.calculateAnalytics();

// Check if analytics div is visible
let analyticsDiv = document.querySelector('[x-show*="analytics"]');
console.log('Analytics div found:', !!analyticsDiv);
console.log('Analytics div visible:', analyticsDiv ? window.getComputedStyle(analyticsDiv).display !== 'none' : false);

// Check for canvas elements
console.log('=== Canvas Elements ===');
['projectStatusChart', 'taskPriorityChart', 'taskTimelineChart'].forEach(id => {
    let canvas = document.getElementById(id);
    console.log(`${id}:`, canvas ? 'Found' : 'Not found');
    if (canvas) {
        console.log(`  Parent visible:`, window.getComputedStyle(canvas.parentElement).display !== 'none');
    }
});

// Check Chart.js
console.log('=== Chart.js ===');
console.log('Chart.js loaded:', typeof Chart !== 'undefined');
if (typeof Chart !== 'undefined') {
    console.log('Chart version:', Chart.version);
}

// Force update charts with debug
setTimeout(() => {
    console.log('=== Updating Charts ===');
    app.updateCharts();
    
    // Check if charts were created
    setTimeout(() => {
        if (typeof Chart !== 'undefined' && Chart.instances) {
            console.log('Active charts:', Object.keys(Chart.instances).length);
        }
    }, 1000);
}, 500);

// Manual chart creation test
setTimeout(() => {
    console.log('=== Manual Chart Test ===');
    const testCanvas = document.getElementById('projectStatusChart');
    if (testCanvas && typeof Chart !== 'undefined') {
        try {
            // Clear canvas
            const ctx = testCanvas.getContext('2d');
            ctx.clearRect(0, 0, testCanvas.width, testCanvas.height);
            
            // Create simple test chart
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Test 1', 'Test 2', 'Test 3'],
                    datasets: [{
                        data: [30, 40, 30],
                        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
                    }]
                }
            });
            console.log('✅ Test chart created successfully');
        } catch (error) {
            console.error('❌ Test chart failed:', error);
        }
    }
}, 2000);