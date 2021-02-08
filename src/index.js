const EXTENSION_NAME = 'Gmaps Wiki Lookup';
const rxGooglePlace = new RegExp(/^https:\/\/www\.google\..{2,3}\/maps\/place/);
const LOOKUP_URL = 'https://#.wikipedia.org/w/api.php?origin=*'
const SEARCH_SELECTOR = '.section-hero-header-title-title';
const SEARCH_SUB_SELECTOR = '.section-hero-header-title-subtitle';

var mainQuery = '';

var observer = new MutationObserver(() => {

   if (document.querySelectorAll(SEARCH_SELECTOR).length > 0) {

      var query = document.querySelector(SEARCH_SELECTOR).textContent.trim();

      if(mainQuery !== query)
         buildQuery();

      mainQuery = query;
      observer.disconnect();
   }
});

chrome.runtime.onMessage.addListener(
   function (request) {
      if (request.message === 'place-page-navigation') {
         observer.observe(document.body, {
            childList: true,
            subtree: true
         });
      }
   }
);


const buildUrl = () => {

   var params = {
      action: 'opensearch',
      limit: '1',
      format: 'json'
   };

   let langTag = document.querySelector('html').getAttribute('lang')
   let lang = langTag && langTag.split('-')[0];

   let url = LOOKUP_URL.replace('#', lang);
   Object.keys(params).forEach(function (key) { url += '&' + key + '=' + params[key]; });

   return url;
}

const buildQuery = async () => {

   let url = buildUrl() + '&search=';
   let query = [document.querySelector(SEARCH_SELECTOR).textContent.trim()];
   query = [...query, ...[...document.querySelectorAll(SEARCH_SUB_SELECTOR)].map(e => e.textContent.trim())];

   let result = false;

   for(let i = query.length; i > 0 && !result; i--) {

      let queryString = encodeURIComponent(query.slice(0, i).join(' '));
      result = await makeQuery(url + queryString);
      console.info(result, url);
   }

   if(result)
      createLink(result);
}

const makeQuery = async (url) => {

   try {
      const r = await fetch(url);
      const j = await r.json();

      if (j && j[3] && j[3][0]) {
         return j[3][0]
      }
   } catch (e) {
      console.warn('Query to wiki api failed', e);
   }

   return false;
}

const createLink = (href) => {
   let wikiLink = document.createElement('a');
   let h2 = document.querySelector(SEARCH_SELECTOR);

   wikiLink.href = href;
   wikiLink.target = '_blank';
   wikiLink.innerHTML = h2.outerHTML;

   h2.parentNode.insertBefore(wikiLink, h2);
   h2.remove();
}

if (rxGooglePlace.test(window.location.href)) {
   observer.observe(document.body, {
      childList: true,
      subtree: true
   });
}