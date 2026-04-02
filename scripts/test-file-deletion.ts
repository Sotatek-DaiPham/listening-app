import { LocalStorageProvider } from '../src/lib/storage/index';
import fs from 'fs';
import path from 'path';

async function test() {
  const storage = new LocalStorageProvider();
  const baseDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure baseDir exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const testFile = 'test-delete.txt';
  const testPath = path.join(baseDir, testFile);
  const testUrl = `/uploads/${testFile}`;

  console.log('--- Test 1: Delete via URL ---');
  fs.writeFileSync(testPath, 'hello world');
  console.log(`Created test file at: ${testPath}`);

  await storage.deleteFile(testUrl);
  if (!fs.existsSync(testPath)) {
    console.log('SUCCESS: File was deleted correctly via URL!');
  } else {
    console.error('FAILURE: File still exists after delete call.');
    process.exit(1);
  }

  console.log('\n--- Test 2: Delete via filename only ---');
  fs.writeFileSync(testPath, 'hello world again');
  await storage.deleteFile(testFile);
  if (!fs.existsSync(testPath)) {
    console.log('SUCCESS: File was deleted correctly via filename only!');
  } else {
    console.error('FAILURE: File still exists after delete call (filename only).');
    process.exit(1);
  }

  console.log('\n--- Test 3: Security Check (Directory Traversal) ---');
  const outsideFile = path.join(process.cwd(), 'test-outside.txt');
  fs.writeFileSync(outsideFile, 'attacker');
  console.log(`Created file outside uploads at: ${outsideFile}`);
  
  await storage.deleteFile('../test-outside.txt');
  if (fs.existsSync(outsideFile)) {
    console.log('SUCCESS: File outside uploads was NOT deleted (security working).');
    fs.unlinkSync(outsideFile);
  } else {
    console.error('FAILURE: File outside uploads WAS deleted (security breach!).');
    process.exit(1);
  }

  console.log('\nAll tests passed!');
}

test().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
