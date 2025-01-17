import {expect} from 'chai';
// @ts-ignore
import {runCommand} from '../../TestUtils';
import * as path from 'path';
import * as sinon from 'sinon';
import {UxDisplay} from "../../../src/lib/Display";
import {BundleName, getMessage} from "../../../src/MessageCatalog";


const dfaTarget = path.join('test', 'code-fixtures', 'projects', 'sfge-smoke-app', 'src');
const projectdir = path.join('test', 'code-fixtures', 'projects', 'sfge-smoke-app', 'src');

const apexControllerStr = 'UnsafeVfController';
const customSettingsStr = 'none found';
const fileCount = '7';
const entryPointCount = '5';
const pathCount = '6';
const violationCount = '2';

const customSettingsMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeMetaInfoCollected', ['Custom Settings', customSettingsStr]);
const apexControllerMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeMetaInfoCollected', ['Apex Controllers', apexControllerStr]);
const compiledMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeFinishedCompilingFiles', [fileCount]);
const startGraphBuildMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeStartedBuildingGraph');
const endGraphBuildMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeFinishedBuildingGraph');
const identifiedEntryMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgePathEntryPointsIdentified', [entryPointCount]);
const completedAnalysisMessage = getMessage(BundleName.EventKeyTemplates, 'info.sfgeCompletedPathAnalysis', [pathCount, entryPointCount, violationCount]);
const experimentalRuleName = "RemoveUnusedMethod";

function isSubstr(output: string, substring: string): boolean {
	const updatedSubstr = substring.replace('[', '\\[');
	const regex = new RegExp(`${updatedSubstr}`, 'gm');
	const regexMatch = output.match(regex);
	return regexMatch != null && regexMatch.length >= 1;
}

function verifyContains(output: string, substring: string): void {
	expect(isSubstr(output, substring), `Output "${output}" should contain substring "${substring}"`).is.true;
}

function verifyNotContains(output: string, substring: string): void {
	expect(isSubstr(output, substring), `Output "${output}" should not contain substring "${substring}"`).is.false;
}

describe('scanner run dfa', function () {
	this.timeout(20000); // TODO why do we get timeouts at the default of 5000?  What is so expensive here?

	describe('End to end', () => {
		describe('Without special flags', () => {
			let sandbox;
			let spy: sinon.SinonSpy;

			before(() => {
				sandbox = sinon.createSandbox();
				spy = sandbox.spy(UxDisplay.prototype, "spinnerUpdate");
			})

			after(() => {
				spy.restore();
				sinon.restore();
			});

			const output = runCommand(`scanner run dfa --target ${dfaTarget} --projectdir ${projectdir} --format json`);


			it('Output is parsable JSON', () => {
				try {
					JSON.parse(output.shellOutput.stdout);
				} catch (error) {
					expect.fail(`Invalid JSON output from --format json: ${output.shellOutput.stdout}; error = ${error}`);
				}
			});

			it('Pilot rules are not executed', () => {
				// Verify that there's NOT a violation somewhere for an experimental rule.
				verifyNotContains(output.shellOutput.stdout, experimentalRuleName);
			});

			it('Contains no verbose-only information', () => {
				// The messages about loading various types of thing should only be logged when --verbose is used.
				const stdout = output.shellOutput.stdout;
				verifyNotContains(stdout, customSettingsMessage);
				verifyNotContains(stdout, apexControllerMessage);
				expect(spy.calledWith(compiledMessage, startGraphBuildMessage, endGraphBuildMessage, identifiedEntryMessage, completedAnalysisMessage));
			});
		});

		describe('Using --with-pilot flag', () => {
			const output = runCommand(`scanner run dfa --target ${dfaTarget} --projectdir ${projectdir} --format json --with-pilot`);

			it('Executes experimental rules', () => {
				// Verify that there's a violation somewhere in there for an experimental rule.
				verifyContains(output.shellOutput.stdout, experimentalRuleName);
			});
		});

		describe('Using --verbose flag', () => {
			const output = runCommand(`scanner run dfa --target ${dfaTarget} --projectdir ${projectdir} --format json --verbose`);

			it('Verbose information is logged', () => {
				// The messages about loading various types of thing should only be logged when --verbose is used.
				const stdout = output.shellOutput.stdout;
				verifyContains(stdout, customSettingsMessage);
				verifyContains(stdout, apexControllerMessage);
			});
		});
	});
});
