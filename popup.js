// const { JSDOM } = require("jsdom")

// Start the Elm application.
var app = Elm.Main.init({
    node: document.getElementById('myapp')
});

app.ports.sendMessage.subscribe(function(message) {
    chrome.storage.local.set({results: `${message}`}, () => console.log("recorded"));
});


window.onload = async function() {
    document.getElementById("scrapeButton").addEventListener("click", hitScrape);
    console.log("initialized");
}

// Source: https://stackoverflow.com/questions/11684454/getting-the-source-html-of-the-current-page-from-chrome-extension
// Injects a script into the current open tab (DOMtoString) then messages it back to the popup
function fetchTab() {
    var result = chrome.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        var activeTab = tabs[0];
        var activeTabId = activeTab.id;

        return chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            // injectImmediately: true,  // uncomment this to make it execute straight away, other wise it will wait for document_idle
            func: DOMtoString,
        });

    }).then(function (results) {
        // console.log(results[0].result);
        return results[0].result;
    }).catch(function (error) {
        // console.log("error!");
        return 'There was an error injecting script : \n' + error.message;
    });

    return result;
}

// TODO: Data extraction
// Calls fetchTab to get HTML contents. Scrapes the HTML string and saves to chrome local storage
async function hitScrape() {
    const results = await fetchTab();
    app.ports.messageReceiver.send(results);

    // const results = page.match(/<p>(.+)<\/p>/);
    // const { document } = new JSDOM(page).window;
    // const results = document.getElementsByTagName("p"); 
    // chrome.storage.local.set({results: `${results}`}, () => console.log("recorded"));
    // console.log(results);
}

// Script that is injected into the current tab to fetch the HTML contents
function DOMtoString() {
    /*
    let unsupportedTags = ["script", "svg"];
    for (let sel of unsupportedTags) {
        tagsBody = document.querySelectorAll(sel);
        tagsBody.forEach((elem) => {
            elem.remove();
        })
    }
    */
    let selectors = ["p"]
    let result = "";
    for (let sel of selectors) {
        tagsBody = document.querySelectorAll(sel);
        tagsBody.forEach((tag) => {
            result += tag.innerHTML;
        });
    }
    console.log(result);
    
    return result; // document.documentElement.outerHTML;
}

function removeUnwantedTags() {
    let unsupportedTags = ["script", "svg"];
    for (let sel of unsupportedTags) {
        tagsBody = document.querySelectorAll(sel);
        tagsBody.forEach((elem) => {
            elem.remove();
        })
    }
    console.log(document);
}

/*
  async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
  }

*/


/*
window.onload= async function(){

    console.log('Popup opened');
    chrome.storage.local.get("leftCur", (result) => document.getElementById("dropLeft").value = `${result.leftCur}` );
    chrome.storage.local.get("leftVal", (result) => console.log(`leftVal is ${result.leftVal}`) );
    chrome.storage.local.get("leftVal", (result) => document.getElementById("leftForm").value = `${result.leftVal}` );

    chrome.storage.local.get("rightCur", (result) => document.getElementById("dropRight").value = `${result.rightCur}` );
    chrome.storage.local.get("rightVal", (result) => console.log(`rightVal is ${result.rightVal}`) );
    chrome.storage.local.get("rightVal", (result) => document.getElementById("rightForm").value = `${result.rightVal}` );

    document.getElementById("leftForm").addEventListener("submit", leftChange);
    document.getElementById("rightForm").addEventListener("submit", rightChange);

    document.getElementById("leftForm").addEventListener("change", leftChange);
    document.getElementById("rightForm").addEventListener("change", rightChange);
    document.getElementById("dropLeft").addEventListener("change", leftChange);
    document.getElementById("dropRight").addEventListener("change", rightChange);
    
    document.getElementById("clearButton").addEventListener("click", hitClear);

    console.log("end of onload")
}

async function hitClear() {
    console.log("CLEARED")
    // Can set defaults in options.
    // chrome.storage.local.clear();

    // chrome.storage.local.set({leftCur: `usd`}, () => console.log("left recorded USD"));
    chrome.storage.local.set({leftVal: ``}, () => console.log("left recorded value"));
    // chrome.storage.local.set({rightCur: `aud`}, () => console.log("right recorded AUD"));
    chrome.storage.local.set({rightVal: ``}, () => console.log("right recorded value"));


    chrome.storage.local.get("leftCur", (result) => document.getElementById("dropLeft").value = `${result.leftCur}` );
    chrome.storage.local.get("leftVal", (result) => console.log(`leftVal is ${result.leftVal}`) );
    chrome.storage.local.get("leftVal", (result) => document.getElementById("leftForm").value = `${result.leftVal}` );

    chrome.storage.local.get("rightCur", (result) => document.getElementById("dropRight").value = `${result.rightCur}` );
    chrome.storage.local.get("rightVal", (result) => console.log(`rightVal is ${result.rightVal}`) );
    chrome.storage.local.get("rightVal", (result) => document.getElementById("rightForm").value = `${result.rightVal}` );

}

async function leftChange() {
    console.log("leftChange called")
    var leftVal = document.getElementById("leftForm").value;
    console.log(`leftVal is ${leftVal}`);
    var leftDrop = document.getElementById("dropLeft");
    var leftCur = leftDrop.options[leftDrop.selectedIndex].value;
    var rightDrop = document.getElementById("dropRight");
    var rightCur = rightDrop.options[rightDrop.selectedIndex].value;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    let response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${leftCur}.json?d=${today}`);
    let json = await response.json();
    
 
    document.getElementById("rightForm").value = leftVal * json[leftCur][rightCur];

    var rightVal = leftVal * json[leftCur][rightCur];

    chrome.storage.local.set({leftCur: `${leftCur}`}, () => console.log("recorded"));
    chrome.storage.local.set({leftVal: `${leftVal}`}, () => console.log("recorded"));
    chrome.storage.local.set({rightVal: `${rightVal}`}, () => console.log(`leftchange right var recorded as ${rightVal}`));
    

}
async function rightChange() {
    var rightVal = document.getElementById("rightForm").value;
    var leftDrop = document.getElementById("dropLeft");
    var leftCur = leftDrop.options[leftDrop.selectedIndex].value;
    var rightDrop = document.getElementById("dropRight");
    var rightCur = rightDrop.options[rightDrop.selectedIndex].value;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

    let response = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${rightCur}.json?d=${today}`);
    let json = await response.json();
 
    document.getElementById("leftForm").value = rightVal * json[rightCur][leftCur];

    var leftVal = rightVal * json[rightCur][leftCur];
    
    chrome.storage.local.set({rightCur: `${rightCur}`}, () => console.log("recorded"));
    chrome.storage.local.set({leftVal: `${leftVal}`}, () => console.log("recorded"));
    chrome.storage.local.set({rightVal: `${rightVal}`}, () => console.log("recorded"));
}



// https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cny.json?d=2022-02-19
*/
