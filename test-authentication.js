// Comprehensive test script for Abathwa Capital authentication and UI
console.log('🧪 Testing Abathwa Capital Authentication & UI...\n');

const testResults = {
  passes: 0,
  failures: 0,
  tests: []
};

function addTest(name, passed, details = '') {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passes++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failures++;
    console.log(`❌ ${name}: ${details}`);
  }
}

// Test 1: Check if app loads
async function testAppLoads() {
  try {
    const response = await fetch('http://localhost:5173');
    const html = await response.text();
    const hasTitle = html.includes('Abathwa Capital');
    addTest('App loads with correct title', hasTitle);
    return hasTitle;
  } catch (error) {
    addTest('App loads with correct title', false, 'Failed to fetch: ' + error.message);
    return false;
  }
}

// Test 2: Check if signup page loads
async function testSignupPageLoads() {
  try {
    const response = await fetch('http://localhost:5173/signup');
    const html = await response.text();
    const hasSignupPage = response.status === 200;
    addTest('Signup page loads', hasSignupPage);
    return hasSignupPage;
  } catch (error) {
    addTest('Signup page loads', false, 'Failed to fetch: ' + error.message);
    return false;
  }
}

// Test 3: Check if login page loads  
async function testLoginPageLoads() {
  try {
    const response = await fetch('http://localhost:5173/login');
    const html = await response.text();
    const hasLoginPage = response.status === 200;
    addTest('Login page loads', hasLoginPage);
    return hasLoginPage;
  } catch (error) {
    addTest('Login page loads', false, 'Failed to fetch: ' + error.message);
    return false;
  }
}

// Test 4: Check for translation key issues
async function testTranslationKeys() {
  try {
    const response = await fetch('http://localhost:5173/login');
    const html = await response.text();
    
    // Check for untranslated keys (these should not appear in the HTML)
    const hasTranslationIssues = html.includes('auth.') || 
                                 html.includes('roles.') || 
                                 html.includes('common.') ||
                                 html.includes('validation.');
    
    addTest('No translation key leaks in UI', !hasTranslationIssues, 
           hasTranslationIssues ? 'Found untranslated keys in HTML' : '');
    return !hasTranslationIssues;
  } catch (error) {
    addTest('No translation key leaks in UI', false, 'Failed to fetch: ' + error.message);
    return false;
  }
}

// Test 5: Check language files exist
async function testLanguageFiles() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const enExists = fs.existsSync(path.join(__dirname, 'src/i18n/locales/en.json'));
    const ndExists = fs.existsSync(path.join(__dirname, 'src/i18n/locales/nd.json'));
    
    addTest('English language file exists', enExists);
    addTest('isiNdebele language file exists', ndExists);
    
    return enExists && ndExists;
  } catch (error) {
    addTest('Language files exist', false, 'Error checking files: ' + error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting comprehensive tests...\n');
  
  await testAppLoads();
  await testSignupPageLoads();
  await testLoginPageLoads();
  await testTranslationKeys();
  await testLanguageFiles();
  
  // Summary
  console.log('\n📊 TEST SUMMARY:');
  console.log(`✅ Passed: ${testResults.passes}`);
  console.log(`❌ Failed: ${testResults.failures}`);
  console.log(`📝 Total: ${testResults.tests.length}`);
  
  if (testResults.failures === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The app is ready for authentication testing.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS:');
  testResults.tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    const details = test.details ? ` (${test.details})` : '';
    console.log(`${status} ${test.name}${details}`);
  });
}

// Check if running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  runTests();
} else {
  console.log('This test script should be run with Node.js');
}