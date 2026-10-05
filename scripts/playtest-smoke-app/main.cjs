const { writeFileSync } = require('node:fs');

const resultPath = process.env.BOBO_PLAYTEST_SMOKE_RESULT?.trim();
if (resultPath) writeFileSync(resultPath, '{"ok":false,"state":"starting"}\n');

require('../playtest-smoke.cjs');
