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




