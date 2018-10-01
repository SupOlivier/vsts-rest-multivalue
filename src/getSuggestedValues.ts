import * as JSONPath from "jsonpath";
import { callApi } from "./RestCall";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

let _suggestedValues: Promise<string[]>;
export async function getSuggestedValues(): Promise<string[]> {
    if (_suggestedValues) {
        return _suggestedValues;
    }
    const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;

    const url: string = inputs.Url;
    if(url)
    {
    let headers:{[header: string]: string};
    if(inputs.Headers){
        headers= JSON.parse(inputs.Headers);
    }
     _suggestedValues = new Promise<string[]>((resolve, reject) =>
        callApi(url, "GET", headers, undefined, (data) =>
            resolve(_findArr(data)), reject)).then(makeUnique);
    
   }else{
        // if the values input were not specified as an input, get the suggested values for the field.
        const service = await WorkItemFormService.getService();
        _suggestedValues = service.getAllowedFieldValues(VSS.getConfiguration().witInputs.FieldName) as Promise<string[]>;
    }

    if(inputs.AlphabeticalOrder){
        _suggestedValues=  _suggestedValues.then(v => v.sort());
    }
    return _suggestedValues;
}

function makeUnique(vals: string[]): string[] {
    const vMap: {[key: string]: boolean} = {};
    return vals.filter((v) => {
        const include = !vMap[v];
        vMap[v] = true;
        return include;
    });
}
// Convert unknown data type to string[]
function _findArr(data: object): string[] {
    const property: string = VSS.getConfiguration().witInputs.Property;
    if (property && property[0] === "$") {
        return JSONPath.query(data, property);
    }

    if (typeof data === "string") {
        data = JSON.parse(data);
    }

    // Look for an array: object itself or one of its properties
    const objs: object[] = [data];
    for (let obj = objs.shift(); obj; obj = objs.shift()) {
        if (Array.isArray(obj)) {
            // If configuration has a the Property property set then map from objects to strings
            // Otherwise assume already strings
            return property ? obj.map((o) => o[property]) : obj;
        } else if (typeof obj === "object") {
            for (const key in obj) {
                objs.push(obj[key]);
            }
        } 
    }
    return [];
}
