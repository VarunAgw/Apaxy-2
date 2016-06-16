function parse_document(content) {
    var output = [];
    $dom = $('<html>').html(content);
    $head = $dom.find(">head");
    $body = $dom.find(">body");

    if (1 == 2) {

    } else if (1 === $body.find(">pre").length && "white" === $body.attr("bgcolor")) {
        // nginx
        $body.find(">pre").find(":nth(0)").remove();
        $body.find(">pre").html($body.find(">pre").html().trim());
        if ("" === $body.find(">pre").html()) {
            return output;
        }
        $.each($body.find(">pre").html().trim().split("\n"), function (index, row) {
            $row = $("<span>").html(row);
            content = $row.contents().eq(1).text().trim().split(/(^.*?(?=  ))|(\d+$)/);
            output.push({
                Name: decodeURIComponent($row.find(">a").attr('href')).replace(/\/$/, ""),
                IsDir: decodeURIComponent($row.find(">a").attr('href')).search(/\/$/) !== -1,
                LastModified: content[1],
                Size: content[1] == "-" ? "" : content[5],
            });
        });
    } else if (1 === $body.find(">pre").length && undefined === $body.attr("bgcolor")) {
        // Apache (-HTMLTable +FancyIndexing)
        $body.find(">pre").find("hr,:nth(0),:nth(1),:nth(2),:nth(3),:nth(4)").remove();
        $body.find(">pre").html($body.find(">pre").html().trim());
        $.each($body.find(">pre").html().split("\n"), function (index, row) {
            $row = $("<span>").html(row);
            content = $row.contents().eq(3).text().trim().split(/  /);
            output.push({
                Icon: $row.find(">img").attr('src'),
                Name: decodeURIComponent($row.find(">a").attr('href')).replace(/\/$/, ""),
                IsDir: decodeURIComponent($row.find(">a").attr('href')).search(/\/$/) !== -1,
                LastModified: content[0],
                Size: content[1] == "-" ? "" : content[1],
            });
        });

    } else if (1 === $body.find(">ul").length) {
        // Apache (-HTMLTable -FancyIndexing)
        $body.find(">ul>li").each(function (index, row) {
            output.push({
                Name: decodeURIComponent($(row).find(">a").attr('href')).replace(/\/$/, ""),
                IsDir: decodeURIComponent($(row).find(">a").attr('href')).search(/\/$/) !== -1,
            });
        });

    } else if (1 === $body.find(">table").length) {
        // Apache (+HTMLTable +/-FancyIndexing)
        $rows = $body.find(">table>tbody");
        $rows.find('>tr').has('>th').remove();
        $rows.find(">tr:nth(0)").has("img[alt='[PARENTDIR]']").remove();
        $rows.children().each(function (index, row) {
            $row = $(row).children();
            output.push({
                Icon: $row.eq(0).find(">img").attr('src'),
                Name: decodeURIComponent($row.eq(1).find(">a").attr('href')).replace(/\/$/, ""),
                IsDir: decodeURIComponent($row.eq(1).find(">a").attr('href')).search(/\/$/) !== -1,
                LastModified: $row.eq(2).text().trim(),
                Size: $row.eq(3).text().trim() == "-" ? "" : $row.eq(3).text().trim(),
            });
        });
    }
    return output;
}

function sort_by_directory(rows) {
    return rows.sort(function (a, b) {
        if (a.IsDir && !b.IsDir) {
            return -1;
        }
        if (!a.IsDir && b.IsDir) {
            return 1;
        }
        if (a.IsDir === b.IsDir) {
            if (a.Name < b.Name) {
                return -1;
            }
            if (a.Name > b.Name) {
                return 1;
            }
        }
    });
}

function get_icon(type) {
//    var file_types = JSON.parse(GM_getResourceText("file_types.json"));
//    var sprite = JSON.parse(GM_getResourceText("icon_sprite.json"));
//
//    if (undefined !== file_types[type]) {
//        return sprite.canvas.sprites.find(function (ob) {
//            return ob.name == file_types[type];
//        }).src;
//    } else if (undefined !== sprite.canvas.sprites.find(function (ob) {
//        return ob.name == type;
//    })) {
//        return sprite.canvas.sprites.find(function (ob) {
//            return ob.name == type;
//        }).src;
//    } else {
//        return sprite.canvas.sprites.find(function (ob) {
//            return ob.name == "default";
//        }).src;
//    }
}

function get_extension(filename) {
    var extension = filename.match(/\.([a-z0-9]+)$/);
    if (null === extension) {
        extension = "";
    } else {
        extension = extension[1];
    }
    return extension;
}

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