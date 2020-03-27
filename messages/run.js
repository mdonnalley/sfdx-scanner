module.exports = {
  "commandDescription": "Evaluate a selection of rules against a specified codebase.",
  "flags": {
    "rulenameDescription": "[Description of 'rulename' parameter]",                   // TODO: Change this once the flag is implemented.
    "categoryDescription": "One or more categories of rules to run. Multiple values can be specified as a comma-separated list.",
    "rulesetDescription": "One or more rulesets to run. Multiple values can be specified as a comma-separated list.",
    "severityDescription": "[Description of 'severity' parameter]",                   // TODO: Change this once the flag is implemented.
    "excluderuleDescription": "[Description of 'exclude-rule' parameter]",            // TODO: Change this once the flag is implemented.
    "orgDescription": "[Description of 'org' parameter]",                             // TODO: Change this once the flag is implemented.
    "suppresswarningsDescription": "[Description of 'suppress-warnings' parameter]",  // TODO: Change this once the flag is implemented.
    "targetDescription": "One or more filepaths or glob patterns to run rules against.",
    "formatDescription": "Specifies result format, and causes results to be written directly to stdout.",
    "outfileDescription": "A file to which the results should be written."
  },
  "validations": {
    "mustTargetSomething": "Please specify a target for the rules using --target.", // TODO: Once --org is implemented, rewrite this message.
    "mustSpecifyOutput": "Please specify an output through either --format or --outfile.",
    "outfileMustBeValid": "--outfile must be a well-formed filepath.",
    "outfileMustBeSupportedType": "--outfile must be of a supported type. Current options are .xml and .csv."
  },
  "output": {
    "noViolationsDetected": "No rule violations found."
  },
  "examples": `Invoking without specifying any rules causes all rules to be run.
  E.g., $ sfdx scanner:run --format xml --target "somefile.js"
    Evaluates all rules against somefile.js.
    
Specifying multiple categories or rulesets is treated as a logical OR.
  E.g., $ sfdx scanner:run --format xml --target "somefile.js" --category "Design,Best Practices" --ruleset "Braces"
    Evaluates all rules in the Design and Best Practices categories, and all rules in the Braces ruleset.
    
Wrap globs in quotes. Use double-quotes in Windows and single-quotes in Unix.
  Unix example:    $ sfdx scanner:run --target './**/*.js,!./**/IgnoreMe.js' ...
  Windows example: > sfdx scanner:run --target ".\\**\\*.js,!.\\**\\IgnoreMe.js" ...
    Both of these will evaluate rules against all .js files below the current directory, except for IgnoreMe.js.
`
};
