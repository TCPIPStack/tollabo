var collabID;
var url = window.location.href;
if(url.indexOf("?")!== -1) {
    collabID = url.substring(url.indexOf("?")+1, url.indexOf("?")+10);
} else {
   collabID = Math.random().toString(36).substr(2, 9);
   window.history.pushState("object or string", "Tollabo", "?"+collabID);
}


