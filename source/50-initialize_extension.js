var apaxy2 = {
    baseURL: "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/view/"
};

jQuery.each(resources, function (key) {
    resources[key] = resources[key].replaceAll("%baseurl%", apaxy2.baseURL);
});