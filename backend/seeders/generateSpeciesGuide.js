/**
 * Generates species‑guide.md in the same folder.
 * Lists base data + full evolution chain for every root species.
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const fs             = require('fs');
const mongoose       = require('mongoose');
const CritterSpecies = require('../models/CritterSpecies');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const all = await CritterSpecies.find().lean();
  const byName = Object.fromEntries(all.map(s => [s.species, s]));
  const roots  = all.filter(s => !Object.values(byName).some(p => p.evolution?.nextSpecies === s.species));

  let md = '# Critter Species Guide\n\n';

  for (const root of roots){
    md += `## ${root.species}  \`${root.baseRarity}\`\n`;
    md += `**Fav Foods:** ${root.foodPreferences.join(', ')}  \n`;
    md += `**Fav Toys:** ${root.playPreferences.join(', ')}  \n`;
    md += `**Traits** → Lv3 *${root.passiveTraitsByLevel[3]}*, `
        + `Lv7 *${root.passiveTraitsByLevel[7]}*, `
        + `Lv10 *${root.passiveTraitsByLevel[10]}*\n\n`;

    /* walk the chain */
    let cur = root;
    let stage = 1;
    while (cur.evolution && cur.evolution.nextSpecies){
      const nxt = byName[cur.evolution.nextSpecies];
      md += `&nbsp;&nbsp;↳ **Stage ${stage}:** ${nxt.species}  `
          + `\`Lv≥${cur.evolution.levelReq}\``;
      if (cur.evolution.itemReq) md += ` + **${cur.evolution.itemReq}**`;
      md += '\n';
      cur = nxt; stage++;
    }
    md += '\n---\n\n';
  }

  fs.writeFileSync(__dirname + '/species-guide.md', md);
  console.log('✅ Wrote species-guide.md');
  await mongoose.disconnect();
})();