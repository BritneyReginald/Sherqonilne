// src/services/purgeJobs.ts

import { purgeExpiredPPETransactions } from "../models/ppeTransaction";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function runPurge() {
  try {
    const removed = await purgeExpiredPPETransactions();
    if (removed > 0) {
      console.log(`🗑️  Purged ${removed} PPE record(s) older than 30 days in the recycle bin`);
    }
  } catch (err) {
    console.error("PPE purge job failed:", err);
  }
}

export function startPurgeJobs() {
  runPurge(); 
  setInterval(runPurge, ONE_DAY_MS);
}