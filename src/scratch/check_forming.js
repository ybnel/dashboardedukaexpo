const fs = require('fs');
const path = require('path');

const csvContent = fs.readFileSync(path.join(__dirname, '../Data Kelas Expo 2026.csv'), 'utf8');

function normalizeCenter(rawCenter) {
    if (!rawCenter) return '';
    let c = rawCenter.trim();
    if (c.toLowerCase().startsWith('sby ')) {
        c = c.substring(4).trim();
    }
    return c;
}

function normalizeProgram(rawProgram) {
    if (!rawProgram) return 'Other';
    const lower = rawProgram.toLowerCase().replace(/\s+/g, '');
    if (lower.includes('smallstars')) return 'Small Stars';
    if (lower.includes('highflyers')) return 'High Flyers';
    if (lower.includes('trailblazer')) return 'Trailblazers';
    if (lower.includes('frontrunner')) return 'Frontrunner';
    return 'Other';
}

function getLevelFromGroupName(groupName, program) {
    if (!groupName) return '';
    const nameUpper = groupName.toUpperCase().trim();
    const progLower = program.toLowerCase();

    if (progLower.includes('small stars')) {
        const match = nameUpper.match(/SS\s*([1-4])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-4])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-4])/);
        if (firstDigit) return firstDigit[1];
    }

    if (progLower.includes('high flyers')) {
        if (nameUpper.includes('FOUNDATION') || nameUpper.includes('FOUND') || nameUpper.includes('FND')) {
            return '0';
        }
        const levelPattern = /(?:1A|1B|2A|2B|3A|3B|4A|4B|G|H|I|J)\b/i;
        const match = nameUpper.match(levelPattern);
        if (match) return match[0].toUpperCase();
    }

    if (progLower.includes('trailblazer')) {
        const match = nameUpper.match(/TB\s*([1-8])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-8])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-8])/);
        if (firstDigit) return firstDigit[1];
    }

    if (progLower.includes('frontrunner')) {
        const match = nameUpper.match(/FR\s*([1-9]|1[0-6])/);
        if (match) return match[1];
        const standalone = nameUpper.match(/\b([1-9]|1[0-6])\b/);
        if (standalone) return standalone[1];
        const firstDigit = nameUpper.match(/([1-9]|1[0-6])/);
        if (firstDigit) return firstDigit[1];
    }

    return '';
}

function getLevelFromGroupCode(groupCode) {
    if (!groupCode) return '';
    const part0 = groupCode.split('-')[0];
    if (part0.length < 5) return '';
    const remaining = part0.substring(2);
    let rawLevel = '';
    if (remaining.toUpperCase().startsWith('V')) {
        rawLevel = remaining.substring(2);
    } else {
        rawLevel = remaining;
    }
    return rawLevel.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

const lines = csvContent.split(/\r?\n/);
const headers = lines[0].split(',');
console.log('Total lines:', lines.length);

const parsed = [];
lines.slice(1).forEach((line, idx) => {
    if (!line.trim()) return;
    const cols = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
        row[h] = cols[i];
    });
    
    const center = normalizeCenter(row['Center']);
    const program = normalizeProgram(row['Program']);
    const groupName = row['Group: Group Name'] ? row['Group: Group Name'].trim() : '';
    const groupCode = row['Group Code'] ? row['Group Code'].trim() : '';
    
    let level = row['Level Program'] ? row['Level Program'].trim() : '';
    if (!level) level = getLevelFromGroupCode(groupCode);
    if (!level) level = getLevelFromGroupName(groupName, program);
    if (level) {
        level = level.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (level === 'FOUNDATION' || level === 'FOUND') level = '0';
    }
    
    if (groupName.toLowerCase().includes('form') || groupName.toLowerCase().includes('found') || (row['Program'] && row['Program'].toLowerCase().includes('found'))) {
        console.log(`Line ${idx+2}: Center="${center}", Program="${program}", Group="${groupName}", GroupCode="${groupCode}", Level="${level}"`);
    }

    parsed.push({ center, program, groupName, groupCode, level });
});

// Check Galaxy Mall specifically for High Flyers / HF foundation / forming
console.log('\n--- Galaxy Mall High Flyers Classes ---');
parsed.filter(p => p.center.toLowerCase().includes('galaxy') && p.program === 'High Flyers').forEach(p => {
    console.log(p);
});
