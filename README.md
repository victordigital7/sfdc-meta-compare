# sfdc-meta-compare
# Salesforce Object Metadata Smart Compare

## Features: 
Smart compare of SFDC Metadata *.object files in 2 folders. Uses XPath to compare elements in the SFDC Object metadata and understands the SFDC metadata structure. 

### Elements supported:
- fields
- actionOverrides
- listViews
- webLinks
- validtion rules
- Checks child elements within the above elements
  - picklist values (default field not supported)

### Elements planned to be supported: 
searchLayouts

Hint: Only elements defined in elementsToCompare[] will be compared. 


### Installation

Requirements: nodejs and npm (https://nodejs.org/) 

- git clone https://github.com/victorkas/sfdc-meta-compare.git
- cd sfdc-meta-compare
- npm install
  - The above command installs dependent modules

### Execute Object Comparison

1. Extract Metadata
  - Use the Force.com IDE to download all standard and custom object metadata
  - Object Metadata will be in /src/objects sub folder
  - Extract Metadata for both orgs that you want to compare

2. Execute the compare: 
  - OSX/Linux: node compare_object.js /fromProd/src/objects /fromSandbox/src/objects 
  - Windows: node compare_object.js "C:\Users\MyName\Desktop\Force\Workspaces\Prod\src\objects" "C:\Users\MyName\Desktop\Force\Workspaces\Sandbox\src\objects"

### Sample Output

Output is stored to diff.txt in the folder where it is run.

```
==================================================================
== File 1: /fromProd/src/objects/Account.object
== File 2: /fromSandbox/src/objects/Account.object
==================================================================
==== Processing: fields
Picklist value does not exist or value different in 2: picklistValues | SamplePickList | ValueA
Picklist value does not exist or value different in 2: picklistValues | SamplePickList | ValueB
Exists in 1 but not in 2: fields | Address__c
Attribute does not exist or value different in 2: fields | BillingAddress.trackHistory
Exists in 1 but not in 2: fields | Branch__c
Exists in 1 but not in 2: fields | Office__c
Attribute does not exist or value different in 2: fields | Description.trackHistory
Exists in 1 but not in 2: fields | Integration_External_ID__c
Attribute does not exist or value different in 2: fields | Phone.trackHistory
==== Processing: actionOverrides
Attribute does not exist or value different in 2: actionOverrides | Edit.type
Attribute does not exist or value different in 2: actionOverrides | New.type
==== Processing: listViews
==== Processing: webLinks
Attribute does not exist or value different in 2: webLinks | GoogleMaps.url
Attribute does not exist or value different in 2: webLinks | GoogleNews.url
Attribute does not exist or value different in 2: webLinks | YahooMaps.url
Exists in 1 but not in 2: webLinks | activities__Create_Tasks_Accounts
==== Processing: validationRules
```



