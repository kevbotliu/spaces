chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
});


chrome.runtime.onStartup.addListener(() => {

})


chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log(changes);
})