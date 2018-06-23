#!/usr/bin/env node

/**
 * This script checks out the specified branch, tags and publishes truffle at
 * <version-tag> where <version-tag> is a pre-release increment with the tag id.
 * It asks you if you're sure you want to do this. It also commits the version
 * update and pushes to the branch. If you exit, it leaves everything alone.
 * *****************************************************************************
 * NB: It updates the package version, publishes, makes a commit and pushes.
 * *****************************************************************************
 * USAGE:
 *   node ./version.js <branch> <tag>
 *
 * ALSO:
 *   npm run publish:byoc
 *   npm run publish:next
 */
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync
const semver = require('semver');
const readline = require('readline');

const args = process.argv.slice(2);

// Example command node ./version.js byoc-safe byoc
const branch = args[0];
const tag = args[1];
const premajor = 'premajor';
const prerelease = 'prerelease';
const opts = {stdio:[0,1,2]};

// Checkout branch
exec(`git checkout ${branch}`, opts);
console.log();

// Read package
console.log('Loading package');
let pkg = fs.readFileSync('./package.json');
pkg = JSON.parse(pkg);

// Get semver increment string
let version;

(!pkg.version.includes(tag))
  ? version = semver.inc(pkg.version, premajor)
  : version = pkg.version;

version = semver.inc(version, prerelease, tag);

console.log(`npm version will be: ${version}\n`)

const warn = `The next command will increment version, commit, ` +
             `publish and push your changes.\n`;

const quest = `Are you sure you want to publish branch '${branch}'' ` +
              `as truffle@${version} | truffle@${tag} (y/n) >> `

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

input.question(warn + quest, (answer) => {
  const affirmations = [
    'y', 'yes', 'YES', 'Yes', 'OK', 'Ok', 'ok', 'peace', 'np', 'almost'
  ];

  // npm version updates the package and commits
  if (affirmations.includes(answer.trim())){
    exec(`npm version ${version}`, opts);
    exec(`npm publish --tag ${tag}`, opts);
    exec(`git push`);
    input.close();
  }

  input.close();
});
