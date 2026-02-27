
import crypto from 'crypto';

// Code from server.ts
const verifyPassword = (password: string, storedHash: string): boolean => {
    if (!storedHash.includes(':')) {
        console.log('Stored hash does not contain ":" - Verification failed format check.');
        return false;
    }
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
};

const hashPassword = (password: string): string => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
};

// Data from seed.ts
const seedHash = '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu9.a';
const password = 'admin123';

console.log(`Testing verification of seed hash: "${seedHash}" with password: "${password}"`);
const result = verifyPassword(password, seedHash);
console.log(`Verification Result: ${result} (Expected: false)`);

console.log('\n--- Generating Valid Hash ---');
const newHash = hashPassword(password);
console.log(`New Hash for "admin123": ${newHash}`);

import fs from 'fs';
fs.writeFileSync('hash_output.txt', newHash);
console.log('Written hash to hash_output.txt');
