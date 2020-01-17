export default function parseParams(url) {
    console.log(url);
    let stringParams = `${decodeURI(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')}`;
    if (stringParams.length > 0) {
        stringParams = `{"${stringParams}"}"`
    } else {
        stringParams = `{}`;
    }
    let params = JSON.parse(stringParams);

    return params;
}