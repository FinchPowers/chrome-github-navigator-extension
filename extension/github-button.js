$(function(){
    chrome.browserAction.onClicked.addListener(function(tab){
        chrome.tabs.executeScript({
            file: "jquery-2.1.0.min.js"
          });
        chrome.tabs.executeScript({
            file: "github-page.js"
          });
        chrome.tabs.insertCSS({
            file: "github-page.css"
        });
    });
});
