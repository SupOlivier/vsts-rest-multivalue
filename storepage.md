Use data from urls as the suggested values of a multivalue control

![Work Item Form](img/form.png)


# How to get started
## Visual Studio Team Services

Navigate to your work item form customization page and add a rest multivalue control.

![Layout Customization](img/layoutCustomization.png)

Edit the control so it can use the right field to store your selection and the right url/property combination to be displayed. For example
```
https://<account>.visualstudio.com/<project>/_apis/build/definitions?api-version=3.0
```
```
name
```
![Options](img/options.png)

If the name is specified it look for the first array in the response and get that property of the array of returned objects.

If property: ```name```

Valid response body:
```
{
    value: [
        {name: 'a'},
        {name: 'b'},
        {name: 'c'}
    ]
}
```

If left blank it will look for the first array in the response and use that (response can just be an array of string too). Example response
```
{
    value: ['1','2',3']
}
```
## On Premises
Navigate the process template xml.
For each work item type to customize at the location 
```xpath
/WITD/WORKITEMTYPE/FORM/WebLayout/Extensions
```
add 
```xml
<Extension Id="rwahl.vsts-multivalue-control-ext" />
```
Within the same Weblayout choose a group element and add
```xml
              <ControlContribution Id="rwahl.vsts-multivalue-control-ext.multivalue-control-ext" Label="<control name>"  >
                <Inputs>
                  <Input Id="FieldName" Value="<longtext field reference name>" />
                  <Input Id="Url" Value="<url>" />
                  <Input Id="Property" Value="<property path>" />
                  <Input Id="Headers" Value='<headers>' />
                  <Input Id="AlphabeticalOrder" Value="true|false" />
                  <Input Id="ItemLimit" Value="<number>" />
                </Inputs>
              </ControlContribution>
```

Argument | Mandatory | Type | Description
-------- | -------- | -------- | --------
FieldName | true | string | Select the field for this control. This is the only input needed if the field is a picklist field with suggested values.
Url | false | string | If the url is filled, the suggested values in the field of the workitem are ignored.
Property | false | string | If the url returns an array of objects, select which object property to use as the string. Leave blank if the server returns an array of strings.
Headers | false | string | Should be in JSON format like '{\"accept\":\"text/plain\"}'
AlphabeticalOrder | false | boolean | Sort by alphabetical order values
ItemLimit | false | number | Limit the number of item selected. Leave blank to have no limit.

# Example usage : Get values from a JSON in a Git Repository

```xml
    <ControlContribution Id="rwahl.vsts-multivalue-control-ext.multivalue-control-ext" Label="PlainText ExternalTest"  >
        <Inputs>
            <Input Id="FieldName" Value="CapsuleTech.PlainText.ExternalTest" />
            <Input Id="Url" Value="http://TFSSERVER/tfs/MyCollection/_apis/git/repositories/REPOSITORY_GUID/items/MyFile.json" />
            <Input Id="Headers" Value='{"accept":"text/plain"}' />
            <Input Id="AlphabeticalOrder" Value="true" />
            <Input Id="ItemLimit" Value="3" />
        </Inputs>
    </ControlContribution>
```

The json file "MyFile.json" in git repository should be on the same Tfs server (for authentication reason) and values should be in one line.
**Example:**
```
[ "Ford", "BMW", "Audi", "Fiat" ,"Renault","Nissan","Peugeot"]
```


# How to query

The selected values are stored in a semicolon separated format.  To search for items that have a specific value use the "Contains Words" operator.  If searching for multiple values, use multipe "Contains Words" clauses for that field.

Alternatively if the Property field starts with '$' it will use the [JSONPath Syntax](http://jsonpath.com/)

**Example:**

Url
```
https://<account>.visualstudio.com/<project>/_apis/wit/workitemtypes?api-version=3.0
```
Property
```
$.value[*].icon.id
```

# Build 
You can also learn how to build your own custom control extension for the work item form [here](https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/custom-control). 
