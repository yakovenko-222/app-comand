const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeApp' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const data = await get('https://api.github.com/repos/yakovenko2/comand/actions/runs/37147841778/jobs');
  console.log(JSON.stringify(data.jobs[0], null, 2));
}

run();
