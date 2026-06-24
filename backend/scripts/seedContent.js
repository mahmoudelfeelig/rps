const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const includeCritters = process.argv.includes('--with-critters');

const scripts = [
  ['Store items', 'seeders/storeSeeder.js'],
  ['Critter species', 'seeders/speciesSeeder.js'],
  ['Pet shop items', 'seeders/shopSeeder.js'],
  ['Tasks and achievements', 'seeders/tasksAndAchievementsSeeder.js'],
  ...(includeCritters ? [['Starter critters for existing users', 'seeders/crittersSeeder.js']] : []),
];

function runScript([label, relativePath]) {
  return new Promise((resolve, reject) => {
    console.log(`\n== ${label} ==`);
    const child = spawn(process.execPath, [path.join(root, relativePath)], {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', code => {
      if (code === 0) return resolve();
      reject(new Error(`${label} failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

async function seedContent() {
  for (const script of scripts) {
    await runScript(script);
  }
  console.log('\nContent seed complete.');
}

if (require.main === module) {
  seedContent().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = seedContent;
