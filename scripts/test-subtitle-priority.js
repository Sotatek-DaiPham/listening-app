const fs = require('fs');
const path = require('path');

// Mock the selection logic from youtube.ts
function selectSrtFile(files, timestamp) {
  const srtFiles = files.filter(f => f.startsWith(`yt_${timestamp}`) && f.endsWith(".srt"));
  
  if (srtFiles.length > 0) {
    const manualSrtFile = srtFiles.find(f => !f.toLowerCase().includes("auto-generated"));
    return manualSrtFile || srtFiles[0];
  }
  return null;
}

function runTests() {
  const timestamp = '123456';
  
  console.log('--- Test 1: Both manual and auto exist ---');
  const files1 = [
    `yt_${timestamp}.en.srt`,
    `yt_${timestamp}.en.auto-generated.srt`,
    `yt_${timestamp}.mp3`
  ];
  const result1 = selectSrtFile(files1, timestamp);
  console.log('Files:', files1);
  console.log('Chosen:', result1);
  if (result1 === `yt_${timestamp}.en.srt`) {
    console.log('SUCCESS: Preferred manual SRT.');
  } else {
    console.error('FAILURE: Did not prefer manual SRT.');
    process.exit(1);
  }

  console.log('\n--- Test 2: Only auto exists ---');
  const files2 = [
    `yt_${timestamp}.en.auto-generated.srt`,
    `yt_${timestamp}.mp3`
  ];
  const result2 = selectSrtFile(files2, timestamp);
  console.log('Files:', files2);
  console.log('Chosen:', result2);
  if (result2 === `yt_${timestamp}.en.auto-generated.srt`) {
    console.log('SUCCESS: Fallback to auto-generated SRT.');
  } else {
    console.error('FAILURE: Failed to fallback.');
    process.exit(1);
  }

  console.log('\n--- Test 3: Multiple languages (priority still manual) ---');
  const files3 = [
    `yt_${timestamp}.vi.auto-generated.srt`,
    `yt_${timestamp}.en.srt`,
    `yt_${timestamp}.mp3`
  ];
  const result3 = selectSrtFile(files3, timestamp);
  console.log('Files:', files3);
  console.log('Chosen:', result3);
  if (result3 === `yt_${timestamp}.en.srt`) {
    console.log('SUCCESS: Picked manual English SRT over auto Vietnamese.');
  } else {
    console.error('FAILURE: Failed priority check.');
    process.exit(1);
  }

  console.log('\nAll priority logic tests passed!');
}

runTests();
