import fs from 'fs';
import { extractPolicyFromPDF } from './src/lib/ai/bedrock';

async function test() {
  try {
    const buf = fs.readFileSync('C:/Users/Acer/Downloads/Police_467810624_1_SAVAŞ  ERCAN_240504_173420.pdf');
    console.log('Sending buffer of size:', buf.length);
    const res = await extractPolicyFromPDF(buf);
    console.log('--- RESULT ---');
    console.log(JSON.stringify(res, null, 2));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.log('ERROR:', msg);
  }
}
test();
