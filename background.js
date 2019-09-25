chrome.tabs.onCreated.addListener(tab => updateBadgeTabCount());
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => updateBadgeTabCount());
chrome.tabs.onDetached.addListener((tabId, detachInfo) => updateBadgeTabCount());
chrome.tabs.onAttached.addListener((tabId, attachInfo) => updateBadgeTabCount());
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => updateBadgeTabCount());
chrome.windows.onFocusChanged.addListener(windowId => updateBadgeTabCount());

function updateBadgeTabCount() {
  chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] });
  chrome.tabs.query({currentWindow: true}, tabs => {
    chrome.browserAction.setBadgeText({text: tabs.length.toString()});
  });
}




chrome.runtime.onStartup.addListener(() => {

})

chrome.commands.onCommand.addListener(function(command) {
  console.log('Command:', command);
});