const fs = require('fs');

let tsTest = fs.readFileSync('tests/integration/ai-service.test.ts', 'utf8');

// Fix model: "test-model", "claude-haiku-4.5",
tsTest = tsTest.replace(/model: "test-model", "claude-haiku-4.5",/g, 'model: "claude-haiku-4.5",');
tsTest = tsTest.replace(/model: "test-model", "haiku-4.5",/g, 'model: "haiku-4.5",');

// Fix bsmv: 0, thgf: 0, inside teminatlar (Coverage) which causes errors
// Since paraBirimi: "TRY", bsmv: 0, thgf: 0, was blindly replaced, let's just restore paraBirimi: "TRY", for coverages.
// Actually, it's simpler to just match the exact lines for Coverages.
tsTest = tsTest.replace(/paraBirimi: "TRY", bsmv: 0, thgf: 0,/g, 'paraBirimi: "TRY",');

// But we need bsmv: 0, thgf: 0 inside primBilgileri. 
// We can just add them manually to primBilgileri where needed.
// E.g., netPrim: 10000, toplamPrim: 10600, paraBirimi: "TRY",
// We can just add them as default for tests:
tsTest = tsTest.replace(/netPrim: (\d+),/g, 'netPrim: $1, bsmv: 0, thgf: 0,');
// Deduplicate if we added it twice
tsTest = tsTest.replace(/bsmv: 0, thgf: 0,(\s*)bsmv: 0, thgf: 0,/g, 'bsmv: 0, thgf: 0,');
tsTest = tsTest.replace(/bsmv: 0, thgf: 0, bsmv: 0, thgf: 0,/g, 'bsmv: 0, thgf: 0,');

fs.writeFileSync('tests/integration/ai-service.test.ts', tsTest);
console.log("Done");
