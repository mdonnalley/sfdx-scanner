import {FakeDisplay} from "../FakeDisplay";
import {initContainer} from "../../../src/ioc.config";
import {RuleFilterFactoryImpl} from "../../../src/lib/RuleFilterFactory";
import {Inputs} from "../../../src/types";
import {expect} from "chai";
import {RuleDescribeAction} from "../../../src/lib/actions/RuleDescribeAction";
import {AnyJson} from "@salesforce/ts-types";
import {Pmd6CommandInfo} from "../../../lib/lib/pmd/PmdCommandInfo";
import {Controller} from "../../../lib/Controller";

describe("Tests for RuleDescribeAction", () => {
	let display: FakeDisplay;
	let ruleDescribeAction: RuleDescribeAction;
	before(() => {
		initContainer();
	});
	beforeEach(() => {
		display = new FakeDisplay();
		ruleDescribeAction = new RuleDescribeAction(display, new RuleFilterFactoryImpl());
	});

	describe("Tests to confirm that PMD7 binary files are invoked when choosing PMD7 with pmd engine", () => {
		afterEach(() => {
			// Until we remove global state, we should cleanup after ourselves to prevent other tests from being impacted
			Controller.setActivePmdCommandInfo(new Pmd6CommandInfo())
		})

		it("When using PMD7, the rule description for a pmd rule should give correct info from PMD 7", async () => {
			const inputs: Inputs = {
				rulename: 'ApexCRUDViolation',
				"preview-pmd7": true
			}
			await ruleDescribeAction.run(inputs);

			const rule: AnyJson  = display.getLastStyledObject();
			expect(rule['name']).to.equal('ApexCRUDViolation');
			expect(rule['engine']).to.equal('pmd');
			expect(rule['isPilot']).to.equal(false);
			expect(rule['enabled']).to.equal(true);
			expect(rule['categories']).to.deep.equal(['Security']);
			expect(rule['rulesets']).to.contain('quickstart');
			expect(rule['languages']).to.deep.equal(['apex']);
			expect(rule['description']).to.have.length.greaterThan(0);
			expect(rule['message']).to.have.length.greaterThan(0);
		})

		it("When using PMD7, the rule description for a cpd rule should give back correct info from PMD 7", async () => {
			const inputs: Inputs = {
				rulename: 'copy-paste-detected'
			}
			await ruleDescribeAction.run(inputs);

			const rule: AnyJson  = display.getLastStyledObject();
			expect(rule['name']).to.equal('copy-paste-detected');
			expect(rule['engine']).to.equal('cpd');
			expect(rule['isPilot']).to.equal(false);
			expect(rule['enabled']).to.equal(false);
			expect(rule['categories']).to.deep.equal(['Copy/Paste Detected']);
			expect(rule['rulesets']).to.deep.equal([]);
			expect(rule['languages']).to.deep.equal(['apex', 'java', 'visualforce', 'xml']);
			expect(rule['description']).to.have.length.greaterThan(0);
		});
	});
});
