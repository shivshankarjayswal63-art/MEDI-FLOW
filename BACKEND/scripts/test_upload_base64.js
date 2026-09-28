const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.env.API_URL || 'http://localhost:5000/api/reports/upload-base64';
  const token = process.env.TEST_TOKEN || '';
  const filePath = process.argv[2] || path.join(__dirname, '..', 'supabase', 'migrations', '001_create_medical_reports.sql');
  const file = fs.readFileSync(filePath);
  const fileBase64 = file.toString('base64');

  try {
    const res = await axios.post(url, {
      fileName: path.basename(filePath),
      fileType: 'application/pdf',
      fileBase64,
      patientNotes: 'test upload',
    }, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
      },
      maxBodyLength: 50 * 1024 * 1024,
      maxContentLength: 50 * 1024 * 1024,
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else {
      console.error(err.message || err);
    }
    process.exit(1);
  }
}

if (require.main === module) main();
