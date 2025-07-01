// Test script to verify Modern UI is working correctly
// Run this in the browser console to test

console.log('🧪 Testing ProjectHub Modern UI...\n');

// Test 1: Check if styles are loaded
const modernUIStyles = document.querySelector('#modern-ui-enhancement-safe');
console.log('✅ Test 1 - Modern UI Styles:', modernUIStyles ? 'Loaded' : 'Not found');

// Test 2: Check if body has enhanced class
const bodyEnhanced = document.body.classList.contains('modern-ui-enhanced');
console.log('✅ Test 2 - Body Enhanced Class:', bodyEnhanced ? 'Applied' : 'Not applied');

// Test 3: Check for dark mode
const darkMode = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
console.log('✅ Test 3 - Dark Mode:', darkMode ? 'Active' : 'Not active');

// Test 4: Check for FAB
const fab = document.querySelector('.modern-ui-fab');
console.log('✅ Test 4 - Floating Action Button:', fab ? 'Present' : 'Not found');

// Test 5: Count enhanced elements
const enhancedCards = document.querySelectorAll('.modern-ui-card').length;
const enhancedButtons = document.querySelectorAll('.modern-ui-button, .modern-ui-button-secondary').length;
const enhancedInputs = document.querySelectorAll('.modern-ui-input').length;
const enhancedTables = document.querySelectorAll('.modern-ui-table').length;

console.log('\n📊 Enhanced Elements Count:');
console.log(`   - Cards: ${enhancedCards}`);
console.log(`   - Buttons: ${enhancedButtons}`);
console.log(`   - Inputs: ${enhancedInputs}`);
console.log(`   - Tables: ${enhancedTables}`);

// Test 6: Check for syntax error prevention
const syntaxErrorPrevention = typeof window.safeAccess === 'function';
console.log('\n✅ Test 6 - Syntax Error Prevention:', syntaxErrorPrevention ? 'Active' : 'Not found');

// Test 7: Check CSS variables
const rootStyles = getComputedStyle(document.documentElement);
const primaryColor = rootStyles.getPropertyValue('--ph-primary').trim();
console.log('✅ Test 7 - CSS Variables:', primaryColor === '#ff6500' ? 'Loaded correctly' : 'Not loaded');

// Test 8: Animation check
const animatedElements = document.querySelectorAll('.modern-ui-animate-fade-in-up').length;
console.log('✅ Test 8 - Animated Elements:', animatedElements);

// Summary
const allTestsPassed = modernUIStyles && bodyEnhanced && darkMode && fab && 
                      enhancedCards > 0 && syntaxErrorPrevention && 
                      primaryColor === '#ff6500';

console.log('\n' + '='.repeat(50));
console.log(allTestsPassed ? 
  '🎉 All tests passed! Modern UI is working correctly!' : 
  '⚠️ Some tests failed. Check the results above.');
console.log('='.repeat(50));

// Visual test - flash the FAB
if (fab) {
  fab.style.transform = 'scale(1.5)';
  fab.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
  setTimeout(() => {
    fab.style.transform = '';
    fab.style.background = '';
  }, 1000);
  console.log('\n👀 Visual Test: FAB should flash green briefly');
}

// Return test results
return {
  stylesLoaded: !!modernUIStyles,
  bodyEnhanced,
  darkMode,
  fabPresent: !!fab,
  enhancedElements: {
    cards: enhancedCards,
    buttons: enhancedButtons,
    inputs: enhancedInputs,
    tables: enhancedTables
  },
  syntaxErrorPrevention,
  cssVariablesLoaded: primaryColor === '#ff6500',
  animatedElements,
  allTestsPassed
};