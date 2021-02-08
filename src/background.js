const rxGooglePlace = new RegExp(/^https:\/\/www\.google\..{2,3}\/maps\/place/);

chrome.tabs.onUpdated.addListener(
   function (tabId, changeInfo) {
      if (changeInfo.url && rxGooglePlace.test(changeInfo.url)) {
         chrome.tabs.sendMessage(tabId, {
            message: 'place-page-navigation'
         })
      }
   }
);
