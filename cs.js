if ($('head').find('>title').text().indexOf("Index of /") === 0 && $('body').find('>h1').text().indexOf("Index of /") === 0) {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    function get_resource(path) {
        return new Promise(function (resolve) {
            $.ajax({
                url: chrome.extension.getURL(path),
                success: function (data) {
                    data = data.replaceAll("__MSG_@@extension_id__", chrome.i18n.getMessage("@@extension_id"));
                    return resolve(data);
                }
            });
        });
    }

    get_resource("view/base.htm").then(function (response) {
        var html = document.documentElement.outerHTML;
        document.documentElement.innerHTML = response;
        $('head').html($('head').html());
        $("<span>").addClass("default_document").css("display", "none").text(html).appendTo('body');
    });
}