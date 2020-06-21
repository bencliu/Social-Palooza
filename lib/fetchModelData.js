var Promise = require("Promise");

/**
  * FetchModel - Fetch a model from the web server.
  *     url - string - The URL to issue the GET request.
  * Returns: a Promise that should be filled
  * with the response of the GET request parsed
  * as a JSON object and returned in the property
  * named "data" of an object.
  * If the requests has an error the promise should be
  * rejected with an object contain the properties:
  *    status:  The HTTP response status
  *    statusText:  The statusText from the xhr request
  *
*/

//Sends XMLHttpRequest to specified URL and returns JSON data object
function fetchModel(url) {
  return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url); //Send GET req to URL
      xhr.responseType = 'json';

      xhr.send(); //Send request

      xhr.onload = () => {
        if (xhr.status >= 400) { //Failure after loading
          reject(xhr.response);
        } else {
          resolve(xhr.response);
        }
      }

      xhr.onerror = () => {
        reject('Request failed');
      }
  });
}

export default fetchModel;
