const { LocalStorageProvider } = require('./src/lib/storage/index');
const fs = require('fs');
const path = require('path');

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

  // 1. Create a dummy file
  fs.writeFileSync(testPath, 'hello world');
  console.log(`Created test file at: ${testPath}`);

  if (fs.existsSync(testPath)) {
    console.log('Test file exists. Proceeding to delete via URL...');
  } else {
    console.error('Failed to create test file.');
    process.exit(1);
  }

  // 2. Try to delete via URL
  try {
    await storage.deleteFile(testUrl);
    
    if (!fs.existsSync(testPath)) {
      console.log('SUCCESS: File was deleted correctly via URL!');
    } else {
      console.error('FAILURE: File still exists after delete call.');
      process.exit(1);
    }
  } catch (err) {
    console.error('ERROR during deletion:', err);
    process.exit(1);
  }

  // 3. Test with filename only
  fs.writeFileSync(testPath, 'hello world again');
  console.log(`Re-created test file for filename-only test.`);
  
  try {
    await storage.deleteFile(testFile);
    if (!fs.existsSync(testPath)) {
      console.log('SUCCESS: File was deleted correctly via filename only!');
    } else {
      console.error('FAILURE: File still exists after delete call (filename only).');
      process.exit(1);
    }
  } catch (err) {
    console.error('ERROR during deletion (filename only):', err);
    process.exit(1);
  }
}

test();
