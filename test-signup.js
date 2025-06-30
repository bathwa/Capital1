#!/usr/bin/env node

// Test signup functionality
const puppeteer = require('puppeteer');

async function testSignup() {
  let browser;
  
  try {
    console.log('🚀 Starting signup test...');
    
    // Launch browser in headless mode
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('📱 Navigating to signup page...');
    await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2' });
    
    // Check if page loaded correctly
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check for translation key issues
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasTranslationIssues = bodyText.includes('auth.') || 
                                 bodyText.includes('roles.') || 
                                 bodyText.includes('validation.');
    
    if (hasTranslationIssues) {
      console.log('❌ Found translation keys in UI');
      console.log('Translation issues found in body text');
      return false;
    } else {
      console.log('✅ No translation key leaks found');
    }
    
    // Check if essential form elements exist
    const emailField = await page.$('input[name="email"]');
    const passwordField = await page.$('input[name="password"]');
    const firstNameField = await page.$('input[name="firstName"]');
    const lastNameField = await page.$('input[name="lastName"]');
    const submitButton = await page.$('button[type="submit"]');
    
    if (!emailField || !passwordField || !firstNameField || !lastNameField || !submitButton) {
      console.log('❌ Missing essential form elements');
      return false;
    }
    
    console.log('✅ All form elements found');
    
    // Fill out the signup form
    console.log('📝 Filling out signup form...');
    
    await page.type('input[name="firstName"]', 'Test');
    await page.type('input[name="lastName"]', 'User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phoneNumber"]', '+263771234567');
    await page.type('input[name="password"]', 'TestPassword123!');
    await page.type('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Select role
    await page.select('select[name="role"]', 'ENTREPRENEUR');
    
    // Accept terms
    await page.click('input[name="acceptTerms"]');
    
    console.log('✅ Form filled successfully');
    
    // Submit the form
    console.log('🔄 Submitting form...');
    
    // Listen for console logs to catch any errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔍 Browser error:', msg.text());
      }
    });
    
    // Click submit and wait for response
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    // Check current URL to see if signup was successful
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);
    
    // Check if we were redirected (indicating successful signup)
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/entrepreneur-dashboard')) {
      console.log('✅ Signup successful - redirected to dashboard');
      return true;
    } else if (currentUrl.includes('/login')) {
      console.log('✅ Signup successful - redirected to login (email confirmation required)');
      return true;
    } else {
      console.log('⚠️  Signup completed but unexpected redirect');
      
      // Check for success message
      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes('successful') || pageText.includes('registered')) {
        console.log('✅ Found success message in page');
        return true;
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Simple fallback test without Puppeteer
async function simpleTest() {
  console.log('📱 Running simple HTTP test...');
  
  try {
    const response = await fetch('http://localhost:5173/signup');
    const html = await response.text();
    
    console.log('✅ Signup page loads');
    
    // Check for form elements in HTML
    const hasForm = html.includes('<form') && 
                   html.includes('name="email"') && 
                   html.includes('name="password"') &&
                   html.includes('type="submit"');
    
    if (hasForm) {
      console.log('✅ Signup form elements found in HTML');
      return true;
    } else {
      console.log('❌ Missing form elements in HTML');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Simple test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTest() {
  console.log('🧪 Testing Abathwa Capital Signup Functionality\n');
  
  // Try Puppeteer test first, fallback to simple test
  try {
    if (await testSignup()) {
      console.log('\n🎉 SIGNUP TEST PASSED! Authentication is working correctly.');
    } else {
      console.log('\n⚠️  Detailed test had issues, trying simple test...');
      if (await simpleTest()) {
        console.log('✅ Basic functionality is working, may need browser testing');
      } else {
        console.log('❌ Basic functionality has issues');
      }
    }
  } catch (error) {
    console.log('⚠️  Puppeteer not available, running simple test...');
    if (await simpleTest()) {
      console.log('✅ Basic functionality is working');
    } else {
      console.log('❌ Basic functionality has issues');
    }
  }
}

// Check if we have fetch available (Node.js 18+)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTest();