#!/usr/bin/env node
/**
 * Script to block dates in the availability_blocks table
 * Usage: node block-dates.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// Disable SSL certificate verification for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Dates to block (last day available for evening checkout)
const blockedRanges = [
  { start: '2026-05-14', end: '2026-05-17', reason: 'Booked (May 14-18, last day available for evening)' },
  { start: '2026-05-30', end: '2026-06-04', reason: 'Booked (May 30-June 5, last day available for evening)' },
  { start: '2026-06-20', end: '2026-06-26', reason: 'Booked (June 20-27, last day available for evening)' },
  { start: '2026-07-25', end: '2026-07-31', reason: 'Booked (July 25-Aug 1, last day available for evening)' },
];

async function blockDates() {
  try {
    console.log('🔒 Blocking dates...\n');

    for (const range of blockedRanges) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);
      const dates = [];

      // Generate all dates in range
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d).toISOString().split('T')[0]);
      }

      // Insert each date
      for (const date of dates) {
        await connection.execute(
          'INSERT INTO availability_blocks (blockDate, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = ?',
          [date, range.reason, range.reason]
        );
        console.log(`✅ Blocked: ${date}`);
      }

      console.log(`\n📅 Range blocked: ${range.start} to ${range.end}`);
      console.log(`   Reason: ${range.reason}\n`);
    }

    console.log('✨ All dates blocked successfully!');
    console.log('\n📝 Summary:');
    console.log('   - May 14-17 (May 18 available for evening)');
    console.log('   - May 30-June 4 (June 5 available for evening)');
    console.log('   - June 20-26 (June 27 available for evening)');
    console.log('   - July 25-31 (Aug 1 available for evening)');

    await connection.end();
  } catch (error) {
    console.error('❌ Error blocking dates:', error.message);
    process.exit(1);
  }
}

blockDates();
