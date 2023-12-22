import {Flags} from '@salesforce/sf-plugins-core';
import {Action, ScannerCommand} from '../../../lib/ScannerCommand';
import {Bundle, getMessage} from "../../../MessageCatalog";
import {PathResolverImpl} from "../../../lib/PathResolver";
import {Display} from "../../../lib/Display";
import {RuleAddAction} from "../../../lib/actions/RuleAddAction";
import {Logger} from "@salesforce/core";

/**
 * Defines the "rule add" command for the "scanner" cli.
 */
export default class Add extends ScannerCommand {
	// These determine what's displayed when the --help/-h flag is provided.
	public static summary = getMessage(Bundle.Add, 'commandSummary');
	public static description = getMessage(Bundle.Add, 'commandDescription');
	public static examples = [
		getMessage(Bundle.Add, 'examples')
	];

	// This defines the flags accepted by this command. The key is the longname, the char property is the shortname,
	// and summary and description is what's printed when the -h/--help flag is supplied.
	public static readonly flags = {
		language: Flags.string({
			char: 'l',
			summary: getMessage(Bundle.Add, 'flags.languageSummary'),
			description: getMessage(Bundle.Add, 'flags.languageDescription'),
			required: true
		}),
		path: Flags.custom<string[]>({
			char: 'p',
			summary: getMessage(Bundle.Add, 'flags.pathSummary'),
			description: getMessage(Bundle.Add, 'flags.pathDescription'),
			multiple: true,
			delimiter: ',',
			required: true
		})()
	};

	protected createAction(logger: Logger, display: Display): Action {
		return new RuleAddAction(logger, display, new PathResolverImpl());
	}
}
