/* 
 * Salesforce Object Metadata Smart Compare
 *
 * Victor Kasenda <victor.kasenda <at> gmail.com> 
 *
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike
 * License. To view a copy of this license, visit
 * 
 *   http://creativecommons.org/licenses/by-sa/2.0/
 *
 * or send a letter to Creative Commons, 559 Nathan Abbott Way, Stanford,
 * California 94305, USA.
 *
 * 
 * Revision 1: Aug-10-2015
 * Initial version
 *
 * 
 *
 * Modules used:
 * https://github.com/jindw/xmldom
 * https://www.npmjs.com/package/command-line-args
 *
 */



/*
Todo: 
- Check default field for picklist 
- other elements: searchLayouts 
*/

var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');
var util = require('util');
var cliArgs = require("command-line-args"); 
var path = require("path");
var glob = require("glob");


// ---------------------- Configuration ----------------------
// SFDC Object XML, first find the corresponding element by fullName, then compare the child elements (compareChildNodes)
var elementsToCompare = [
	{tag: "fields", nameField: "fullName"}, 
	{tag: "actionOverrides", nameField: "actionName"}, 
	{tag: "listViews", nameField: "fullName"}, 
	{tag: "webLinks", nameField: "fullName"}, 
	{tag: "validationRules", nameField: "fullName"}
];

function escapeHtml(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------------------- Command Line Params ----------------------
var cli = cliArgs([
    // { name: "verbose", type: Boolean, alias: "v", description: "Write plenty output" },
    { name: "help", type: Boolean, alias: "h", description: "Print usage instructions" },
    { name: "files", type: Array, defaultOption: true, description: "Specify 2 folders with Salesforce object metadata to compare - Folder1 Folder2. This is the folder containing *.object files" }
]);

/* parse the supplied command-line values */
var options = cli.parse();
 
/* generate a usage guide */
var usage = cli.getUsage({
    header: "Salesforce Object Metadata Smart Compare",
    footer: "\n\n  For more information, visit <<TODO>>\n  Example: node compare_object.js /Users/me/SFDCMetadataSandbox/src/objects /Users/me/SFDCMetadataProduction/src/objects"
});

var wstream = fs.createWriteStream('diff.txt');


function dolog(s) {
	console.log(s);
	wstream.write(s + "\n");
}

function iterateFiles() {		
	dolog("Folder 1: " + options.files[0]);
	dolog("Folder 2: " + options.files[1]);

	// var fileList = fs.readdirSync(options.files[0]);
	var fileList = glob.sync(path.join(options.files[0], "*.object"));
	fileList.forEach(function (f) {

		var xml1 = fs.readFileSync(f).toString();
		//var xml2 = fs.readFileSync(file2, "utf8");		
		
		// find corresponding file in path 2
		p2 = path.join(options.files[1], path.basename(f));
    try {
  		var xml2 = fs.readFileSync(p2).toString();

  		dolog("\n==================================================================")
  		dolog("== File 1: " + f)
  		dolog("== File 2: " + p2)
  		dolog("==================================================================")

  		compareObjects(new dom().parseFromString(xml1), new dom().parseFromString(xml2));
    } 
    catch (e) {
      dolog("\n==================================================================")
      dolog("== Object does not exist in Folder 2: " + path.basename(f));
      dolog("==================================================================")    }
	});
}

function comparePicklistValues(picklistNode, parentName, doc2) {
	// select all picklistValues under this node
	var picklistValuesXPath = "*[local-name()='picklistValues']";
	var picklistValues = select(picklistNode, picklistValuesXPath);
	picklistValues.forEach(function(picklistValueNode) {

			var picklistValueFullNameNode = select(picklistValueNode, "*[local-name()='fullName']");
			var picklistValueName = picklistValueFullNameNode[0].firstChild.data;

		  // Example xpath: //*[local-name()='fields']/*[local-name()='fullName'][text()='Status']/../*[local-name()='picklist']/*[local-name()='picklistValues']/*[local-name()='fullName'][text()='Activated']
			var xpathDoc2 = util.format(
				"//*[local-name()='fields']/*[local-name()='fullName'][text()='%s']/../*[local-name()='picklist']/*[local-name()='picklistValues']/*[local-name()='fullName'][text()='%s']",
				parentName, picklistValueName);		

			// dolog(xpathDoc2);

			var doc2Nodes = select(doc2, xpathDoc2);
			if (doc2Nodes.length == 0) {
				dolog(util.format("Picklist value does not exist or value different in 2: %s | %s | %s", "picklistValues", parentName, picklistValueName));
			}

	});

}


// Compare values of elements within 2nd level components fields, actionOverrides, listViews
// parentNode: fields/actionOverrides etc.
// parentNameField: the element that contains the name
// parentName: value of the name field
// childNodes: list of child nodes 
function compareChildNodes(parentNode, parentNameField, parentName, childNodes, doc2) {
	childNodes.forEach(function (n) {
		//dolog("--childNode: " + parentNode.localName + " | " + parentName + " | " + n.localName + " | " + n.firstChild.data);		
		if (n.localName == "picklist") {
			// dolog(util.format("-------------- Picklist found: %s | %s", parentNode.localName, parentName));
			comparePicklistValues(n, parentName, doc2);
		}
		else {
			var doc1value = n.firstChild.data;

			// find the child node in doc2
			// find the node with fullName=x, and get the sibling element's value
			// //*[local-name()='fields']/*[local-name()='fullName'][text()='Site']/../*[local-name()='trackFeedHistory'][text()='false']
			
			var xpath = util.format(
				"//*[local-name()='%s']/*[local-name()='%s'][text()='%s']/../*[local-name()='%s'][text()='%s']", 
				parentNode.localName, parentNameField, parentName, n.localName, escapeHtml(doc1value));
			
			// xpath that first finds the elements. but does not work if element name is repeated e.g. "columns"
			//var xpath = util.format(
			//	"//*[local-name()='%s']/*[local-name()='%s'][text()='%s']/../*[local-name()='%s']", 
			//	parentNode.localName, parentNameField, parentName, n.localName);		
			//dolog(xpath);
			var doc2Nodes = select(doc2, xpath);

			if (doc2Nodes.length == 0) {
				// shows the value: 
        // dolog(util.format("Attribute does not exist or value different in 2: %s | %s.%s | %s", parentNode.localName, parentName, n.localName, doc1value));

        // does not output value, neater
        dolog(util.format("Attribute does not exist or value different in 2: %s | %s.%s", parentNode.localName, parentName, n.localName));        
			}
			
			/*
		 	if (doc2Nodes.length == 0) {
				dolog(util.format("Does not exist: %s | %s.%s", parentNode.localName, parentName, n.localName));
			}
			else {
				// compare value in doc1 vs doc2
				var doc2value = doc2Nodes[0].firstChild.data;
				if (doc1value != doc2value) {
					dolog(util.format("Attribute different: %s | %s.%s | file1=%s | file2=%s", 
						parentNode.localName, parentName, n.localName, doc1value, doc2value));
				}
			}*/			
		}


		
	});
}

function compareObjects(doc1, doc2) {
	elementsToCompare.forEach(function (e) {
		// dolog("== The following " + e.tag + " do not exist in file 2: Tag | Name ");	
		dolog("==== Processing: " + e.tag);	
		var elemNodes = select(doc1, util.format("//*[local-name()='%s']", e.tag));	

		var matchCount = 0;

		elemNodes.forEach(function (elemNode) {

			// find the name node
			//dolog("=== nameField: " + e.nameField);			
			var subNode = select(elemNode, util.format("*[local-name()='%s']", e.nameField));
			var fullName = subNode[0].firstChild.data
			//dolog(fullName);

			// check element with that name exists in other file
			var doc2Node = select(doc2, util.format("//*[local-name()='%s']/*[local-name()='%s'][text()='%s']", e.tag, e.nameField, fullName));
			//dolog(doc2Node);
			if (doc2Node.length == 0) {
				dolog("Exists in 1 but not in 2: " + e.tag + " | " + fullName);
				matchCount++;
			} 
			else {
				// element exists, compare value of all child elements from doc1 vs doc2
				var childElems = select(elemNode, "*");
				compareChildNodes(elemNode, e.nameField, fullName, childElems, doc2);
			}

		});		

		
	});

}
 

function main() {
	// ---------------------- Main ----------------------
	if (options.help || options.files == null) {
		dolog(usage);	
	}
	else {
    dolog("\nSalesforce Object Metadata Smart Compare\n\n");
		iterateFiles();	

    console.log("\nDifference written to file: diff.txt");
    console.log("Note: If you require differences in File 2 vs File 1 please run compare again with folder order changed.");

	}

	wstream.end();	

}

main();




