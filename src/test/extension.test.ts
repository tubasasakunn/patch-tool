import * as assert from 'assert';
import * as mocha from 'mocha';
import * as vscode from 'vscode';

mocha.suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    mocha.test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});