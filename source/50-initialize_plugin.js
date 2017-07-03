var getScriptURL = (function () {
  var scripts = document.getElementsByTagName('script');
  var index = scripts.length - 1;
  var myScript = scripts[index];
  return function () {
    return myScript.src;
  };
})();

var apaxy2 = {
  baseURL: getScriptURL().replace(/[^\/]+$/, "")
};

jQuery.each(resources, function (key) {
  resources[key] = resources[key].replaceAll("%baseurl%", apaxy2.baseURL);
});

