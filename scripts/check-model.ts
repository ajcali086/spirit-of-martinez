/**
 * The model's checks, for CI and by hand (npm run check:model): prints every
 * problem and exits 1 if there are any; lists provisional IDs and readings
 * waiting to be re-recorded, which are not failures.
 */
import { audioToRerecord, problems, provisionalIds } from "../src/model/validate.ts";

const found = problems();
const provisional = provisionalIds();
const rerecord = audioToRerecord();
if (provisional.length)
  console.log(`provisional until frozen (${provisional.length}):\n  ${provisional.join("\n  ")}`);
if (rerecord.length)
  console.log(`readings to re-record (${rerecord.length}):\n  ${rerecord.join("\n  ")}`);
if (found.length) {
  console.error(`model check failed (${found.length}):\n  ${found.join("\n  ")}`);
  process.exit(1);
}
console.log("model check passed");
