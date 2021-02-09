const LOOKUP_URL = 'https://#.wikipedia.org/w/api.php?origin=*'
const SEARCH_SELECTOR = '.section-hero-header-title-title';
const SEARCH_SUB_SELECTOR = '.section-hero-header-title-subtitle';
const hasPlaceSelected = () => document.querySelectorAll(SEARCH_SELECTOR).length > 0;

var mainQuery = '';

// Only start extension if regex matches a google maps site
if(new RegExp(/https:\/\/www\.google\..{2,3}\/maps/).test(window.location.href)) {

   if(hasPlaceSelected()) {
      buildQuery();
   } 

   // Wait for a place to be selected by the user
   new MutationObserver(() => {
      if (hasPlaceSelected()) {
         var query = document.querySelector(SEARCH_SELECTOR).textContent.trim();
         if(mainQuery !== query) buildQuery();
         mainQuery = query;
      }
      else
         mainQuery = '';
   }).observe(document.body, {
      childList: true,
      subtree: true
   });
}

function buildUrl() {

   let params = { action: 'opensearch', limit: '1', format: 'json' };
   let langTag = document.querySelector('html').getAttribute('lang')
   let lang = langTag && langTag.split('-')[0];

   let url = LOOKUP_URL.replace('#', lang);
   Object.keys(params).forEach(function (key) { url += '&' + key + '=' + params[key]; });

   return url;
}

async function buildQuery() {

   let url = buildUrl() + '&search=';
   let query = [document.querySelector(SEARCH_SELECTOR).textContent.trim()];
   query = [...query, ...[...document.querySelectorAll(SEARCH_SUB_SELECTOR)].map(e => e.textContent.trim())];

   let result = false;

   for(let i = query.length; i > 0 && !result; i--) {

      let queryString = encodeURIComponent(query.slice(0, i).join(' '));
      result = await makeQuery(url + queryString);
   }

   if(result)
      createLink(result);
}

async function makeQuery (url) {

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

function createLink (href) {
   let wikiLink = document.createElement('a');
   let h2 = document.querySelector(SEARCH_SELECTOR);

   wikiLink.href = href;
   wikiLink.target = '_blank';
   wikiLink.innerHTML = h2.outerHTML;

   h2.parentNode.insertBefore(wikiLink, h2);
   h2.remove();
}