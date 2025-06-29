// Script to generate synthetic model weights for demonstration
// In production, these would be trained models with real weights

const fs = require('fs');
const path = require('path');

// Generate random weights for reliability model
function generateReliabilityWeights() {
  const weights = new Float32Array(4 * 16 + 16 + 16 * 8 + 8 + 8 * 1 + 1);
  
  // Initialize with small random values
  for (let i = 0; i < weights.length; i++) {
    weights[i] = (Math.random() - 0.5) * 0.2;
  }
  
  return weights.buffer;
}

// Generate random weights for risk assessment model
function generateRiskAssessmentWeights() {
  const weights = new Float32Array(6 * 20 + 20 + 20 * 12 + 12 + 12 * 3 + 3);
  
  // Initialize with small random values
  for (let i = 0; i < weights.length; i++) {
    weights[i] = (Math.random() - 0.5) * 0.2;
  }
  
  return weights.buffer;
}

// Create directories if they don't exist
const reliabilityDir = path.join(__dirname, '../public/models/reliability');
const riskAssessmentDir = path.join(__dirname, '../public/models/risk-assessment');

if (!fs.existsSync(reliabilityDir)) {
  fs.mkdirSync(reliabilityDir, { recursive: true });
}

if (!fs.existsSync(riskAssessmentDir)) {
  fs.mkdirSync(riskAssessmentDir, { recursive: true });
}

// Generate and save weights
const reliabilityWeights = generateReliabilityWeights();
const riskAssessmentWeights = generateRiskAssessmentWeights();

fs.writeFileSync(path.join(reliabilityDir, 'weights.bin'), Buffer.from(reliabilityWeights));
fs.writeFileSync(path.join(riskAssessmentDir, 'weights.bin'), Buffer.from(riskAssessmentWeights));

console.log('Model weights generated successfully!');
console.log('Note: These are synthetic weights for demonstration purposes.');
console.log('In production, use properly trained model weights.');