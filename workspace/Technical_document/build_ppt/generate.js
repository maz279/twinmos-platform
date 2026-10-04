// generate.js — assembles the TwinMOS management deck from parts 1-3
const pptxgen = require("pptxgenjs");
const part1 = require("./deck_part1.js");
const part2 = require("./deck_part2.js");
const part3 = require("./deck_part3.js");

const OUT = "F:/software_project/Software_Project_14/TwinMOS_Corporate_Website/Technical_document/TwinMOS_Platform_Management_Presentation.pptx";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.author = "Unisoft System Ltd";
pres.company = "Unisoft System Ltd";
pres.title = "TwinMOS Digital Platform \u2014 Management Presentation";
pres.subject = "Features, benefits, competitive analysis, customer reach and technical superiority";
pres.revision = "1";

const n1 = part1.build(pres);
const n2 = part2.build(pres);
const n3 = part3.build(pres);

pres.writeFile({ fileName: OUT })
  .then((f) => console.log(`OK slides=${n1}+${n2}+${n3}=${n1 + n2 + n3} file=${f}`))
  .catch((e) => { console.error("FAILED:", e); process.exit(1); });
