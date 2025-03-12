#!/usr/bin/env node
import fs from 'fs';

// Load run activities data
const runActivities = JSON.parse(fs.readFileSync('run-activities.json', 'utf8'));
const daysData = JSON.parse(fs.readFileSync('run-days.json', 'utf8'));

// Start date and end date
const START_DATE = new Date('2019-12-21T00:00:00Z');
const TODAY = new Date();

// Create a map of all days with runs
const daysWithRuns = {};
daysData.daysList.forEach(day => {
    daysWithRuns[day] = true;
});

// Generate all dates from start to today
const allDates = [];
const currentDate = new Date(START_DATE);
while (currentDate <= TODAY) {
    const dateStr = currentDate.toISOString().split('T')[0];
    allDates.push(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
}

// Find days without runs
const daysWithoutRuns = allDates.filter(date => !daysWithRuns[date]);

// Calculate the longest streak
let currentStreak = 0;
let longestStreak = 0;
let longestStreakStart = null;
let longestStreakEnd = null;

for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    if (daysWithRuns[date]) {
        currentStreak++;
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakEnd = date;
            longestStreakStart = allDates[i - currentStreak + 1];
        }
    } else {
        currentStreak = 0;
    }
}

// Calculate current streak
let currentStreakCount = 0;
for (let i = allDates.length - 1; i >= 0; i--) {
    if (daysWithRuns[allDates[i]]) {
        currentStreakCount++;
    } else {
        break;
    }
}

// Find the most recent missed day
const mostRecentMissedDay = daysWithoutRuns.length > 0 ? 
    daysWithoutRuns[daysWithoutRuns.length - 1] : 'None';

// Output results
console.log(`Total days since start: ${allDates.length}`);
console.log(`Days with runs: ${daysData.totalDays}`);
console.log(`Days without runs: ${daysWithoutRuns.length}`);
console.log(`Run completion rate: ${(daysData.totalDays / allDates.length * 100).toFixed(2)}%`);
console.log(`\nLongest streak: ${longestStreak} days`);
console.log(`Longest streak period: ${longestStreakStart} to ${longestStreakEnd}`);
console.log(`\nCurrent streak: ${currentStreakCount} days`);
console.log(`\nMost recent missed day: ${mostRecentMissedDay}`);

// Output the first 10 and last 10 missed days
console.log('\nFirst 10 missed days:');
daysWithoutRuns.slice(0, 10).forEach(day => console.log(day));

console.log('\nLast 10 missed days:');
daysWithoutRuns.slice(-10).forEach(day => console.log(day));

// Save missed days to file
fs.writeFileSync('missed-days.json', JSON.stringify({
    totalMissedDays: daysWithoutRuns.length,
    missedDays: daysWithoutRuns,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
    currentStreak: currentStreakCount,
    mostRecentMissedDay
}, null, 2));

console.log('\nDetailed missed days saved to missed-days.json');
