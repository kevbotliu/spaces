
// DEBUG
// chrome.storage.sync.clear(() => {});
// chrome.storage.sync.get(null, result => console.log(result))
/* ---------------------------------------------------------------- */

// Inital populate space elements from synced storage
chrome.storage.sync.get(null, result => {
  console.log(result);
  for (let key in result) {
    let space = result[key];
    space.windows = new Set(space.windows);
    addSpaceElement(space);
    chrome.windows.getCurrent(wd => {
      if (space.windows.has(wd.id)) {
        document.getElementById(space.id).classList.add('current-space');
      }
    });
  }
});
chrome.tabs.query({currentWindow: true}, tabs => {
  document.getElementById('new-space-input').placeholder = "Add new space for " + tabs.length + " tabs...";
});

// Watch for space changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log(changes);
  for (let key in changes) {
    // New space
    if (!('oldValue' in changes[key])) {
      addSpaceElement(changes[key].newValue);
    }
    // Space modified
    else {
      let space = changes[key].newValue;
      let prevSpace = changes[key].oldValue;

      chrome.windows.getCurrent(wd => {
        if (prevSpace.windows.includes(wd.id) && !space.windows.includes(wd.id)) {
          document.getElementById(space.id).classList.remove('current-space');
        }
        else if (!prevSpace.windows.includes(wd.id) && space.windows.includes(wd.id)) {
          document.getElementById(space.id).classList.add('current-space');
        }
        // Modified, but current space is the same
        else {
          
        }
      });
    }
  }


})




function setSpace(id, name, color, tabList, windows) {
  if (tabList.length > 50) return; // Hitting max tab limit
  // if (!(id in spaces) && Object.keys(spaces).length >= 10) return; // Creating new space limit reached

  let space = {
    'id': id,
    'name': name,
    'tabs': tabList,
    'color': color,
    'windows': [...windows]
  };
  
  chrome.storage.sync.set({[id]: space}, () => {
    console.log(`Set space ${name} of ${tabList.length} tabs with ID: ${id} and color: ${color}`);
  })

  // If new, switch to current space but don't reload tabs
  chrome.storage.sync.get(null, result => {
    if (!(id in result)) {
      setCurrentSpace(id, false);
    }
  });

  return space;
}

function removeSpace(spaceId) {
  chrome.storage.sync.remove(spaceId, () => {
    return console.log(`Removed space with ID: ${spaceId}`);
  })
}

function setCurrentSpace(spaceId, loadTabs=true) {
  chrome.windows.getCurrent(wd => {
    chrome.storage.sync.get(null, spaces => {
      for (let key in spaces) {
        if (spaces[key].windows.includes(wd.id)) {
          let prevSpace = spaces[key];
          prevSpace.windows = new Set(prevSpace.windows);
          prevSpace.windows.delete(wd.id);
          prevSpace.windows = [...prevSpace.windows];

          chrome.storage.sync.set({[prevSpace.id]: prevSpace}, () => {
            console.log(`Unset space '${prevSpace.name}' with ID: ${prevSpace.id} as current space`);
          });
        }
      }
    })

    chrome.storage.sync.get(spaceId, result => {
      let space = result[spaceId];
      space.windows = new Set(space.windows);
      space.windows = [...space.windows.add(wd.id)];

      chrome.storage.sync.set({[spaceId]: space}, () => {
        console.log(`Set space '${space.name}' with ID: ${spaceId} as current space`);
      });
    });

    chrome.storage.sync.get(spaceId, result => {
      if (loadTabs) loadSpaceTabs(result[spaceId]);
    });
  })
  

  
}



function loadSpaceTabs(space) {
  chrome.tabs.query({currentWindow: true}, tabs => {
    let tabIds = tabs.map(item => item.id);
    let lastTabId = tabIds.pop();
    chrome.tabs.remove(tabIds, () => {
      let activeTab = space.tabs[space.tabs.length-1];
      chrome.tabs.update(lastTabId, {
        url: activeTab.url,
        pinned: activeTab.pinned
      })
      space.tabs.forEach((tb, i) => {
        if (tb.id !== activeTab.id) {
          chrome.tabs.create({
            url: tb.url,
            pinned: tb.pinned,
            active: false,
            index: i
          });
        }
      })
      // Always close popup on switch
      window.close();
    });
  });
}




function getFormattedTabs(tabs) {
  return tabs.map(tb => {
    return {
      id: tb.id,
      windowId: tb.windowId,
      pinned: tb.pinned,
      url: tb.url
    };
  })
}


function addSpaceElement(space) {
  const spacesList = document.getElementById('space-list');

  const spacesItem = document.createElement('LI');
  const spacesItemText = document.createTextNode(space.name);
  spacesItem.appendChild(spacesItemText);
  spacesItem.id = space.id;
  spacesItem.classList.add('space-item');
  
  spacesItem.addEventListener('click', () => setCurrentSpace(space.id))

  spacesList.appendChild(spacesItem);
}


// Input submit event listeners
document.getElementById('new-space-input').addEventListener("keypress", (e) => {
  let val = document.getElementById('new-space-input').value;
  if (e.key === 'Enter' && val !== '') return submitInput(val);
});
document.getElementById('input-submit').addEventListener('click', () => {
  let val = document.getElementById('new-space-input').value;
  if (val !== '') return submitInput(val);
});

function submitInput(name) {
  chrome.tabs.query({currentWindow: true}, tabs => {
    chrome.windows.getCurrent(wd => {
      const id = (Math.floor(Math.random() * (Math.floor(99999999) - Math.ceil(10000000))) + Math.ceil(10000000)).toString();
      const tabList = getFormattedTabs(tabs);
      const color = 'blah';
      const windows = new Set([wd.id]);

      let space = setSpace(id, name, color, tabList, windows);
      if (space !== undefined) document.getElementById('new-space-input').value = "";
    });
  }); 
}


