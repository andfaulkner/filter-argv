// Store original process.argv
const oldProcArgs = Object.assign({}, process.argv);

/************************************** THIRD-PARTY IMPORTS ***************************************/
const { expect } = require('chai');
const mocha = require('mocha');

/*************************************** TESTED FILE IMPORT ***************************************/
const cliArgsMinusFlags = require('../index');

/********************************************* TESTS **********************************************/
describe('index.js', function() {
    it('index.js exists', function() {
      expect(cliArgsMinusFlags).to.exist;
    });

    describe('cliArgsMinusFlags', function() {
        it('exists', function () { expect(cliArgsMinusFlags).to.exist });

        it('does not exclude items not prefixed with - or -- from arrays given', function() {
            expect(cliArgsMinusFlags(['asdf'])).to.eql(['asdf']);
        });

        it('excludes items prefixed with - or -- from arrays', function() {
            const testArray1 = ['asdf', '--ok', '-v', 'ntyo'];
            expect(cliArgsMinusFlags(testArray1)).to.eql(['asdf', 'ntyo']);
        });

        it('defaults to using process.argv as arrayList if no argument given', function () {
            process.argv = ['argOne', 'argTwo', 'argThree'];
            expect(cliArgsMinusFlags()).to.eql(process.argv);

            process.argv = ['argOne', 'argTwo', '--flag', 'argThree'];
            expect(cliArgsMinusFlags()).to.eql(['argOne', 'argTwo', 'argThree']);
   
            process.argv = Object.assign({}, oldProcArgs); // restore args
        });
    });
});

// Restore original process.argv
process.argv = Object.assign({}, oldProcArgs);

