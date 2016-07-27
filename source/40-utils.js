var parser = {
    is_directory_listing: function (content) {
        return content.search("<title>Index of /") !== -1 && content.search("<h1>Index of /") !== -1;
    },
    sort_rows: function (rows) {
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
    },
    parse_document: function (content) {
        var output = [];
        var body = '<div id="body-mock">' + content.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '') + '</div>';
        var $body = $(body);
        body = $body[0];

        if (1 === $body.find(">pre").length && "white" === $body.attr("bgcolor")) {
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
                    Path: $row.find(">a").attr('href'),
                    IsDir: decodeURIComponent($row.find(">a").attr('href')).search(/\/$/) !== -1,
                    LastModified: content[1],
                    Size: content[1] == "-" ? "" : content[5]
                });
            });
        } else if (1 === $body.find(">pre").length && undefined === $body.attr("bgcolor")) {
            // Apache (FancyIndexing -HTMLTable)
            $body.find(">pre").find("hr,:nth(0),:nth(1),:nth(2),:nth(3),:nth(4)").remove();
            $body.find(">pre").html($body.find(">pre").html().trim());
            $.each($body.find(">pre").html().split("\n"), function (index, row) {
                $row = $("<span>").html(row);
                if ("[PARENTDIR]" === $row.find(">img").attr('alt')) {
                    return;
                }
                content = $row.contents().eq(3).text().trim().split(/  /);
                output.push({
                    Icon: $row.find(">img").attr('src'),
                    Name: decodeURIComponent($row.find(">a").attr('href')).replace(/\/$/, ""),
                    Path: $row.find(">a").attr('href'),
                    IsDir: decodeURIComponent($row.find(">a").attr('href')).search(/\/$/) !== -1,
                    LastModified: content[0],
                    Size: content[1] == "-" ? "" : content[1]
                });
            });

        } else if (1 === $body.find(">ul").length) {
            // Apache (-HTMLTable -FancyIndexing)
            $body.find(">ul>li:not(:has(a:contains(Parent Directory)))").each(function (index, row) {
                output.push({
                    Name: decodeURIComponent($(row).find(">a").attr('href')).replace(/\/$/, ""),
                    Path: $(row).find(">a").attr('href'),
                    IsDir: decodeURIComponent($(row).find(">a").attr('href')).search(/\/$/) !== -1,
                    LastModified: "",
                    Size: ""
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
                    Path: $row.eq(1).find(">a").attr('href'),
                    IsDir: decodeURIComponent($row.eq(1).find(">a").attr('href')).search(/\/$/) !== -1,
                    LastModified: $row.eq(2).text().trim(),
                    Size: $row.eq(3).text().trim() == "-" ? "" : $row.eq(3).text().trim(),
                });
            });
        }

        output = this.sort_rows(output);
        return output;
    }
};


var media = {
    get_extension: function (filename) {
        var extension = filename.match(/\.[\w\d]+$/);
        return (null !== extension ? extension[0] : "");
    },
    get_icon: function (filename) {
        var extension = this.get_extension(filename);
        return (undefined !== file_types[extension] ? file_types[extension] : "default.png");
    },
    get_current_dir: function (url) {
        var a = document.createElement("a");
        a.href = url;
        return a.pathname;
    },
    get_parent_dir: function (url) {
        var a = document.createElement("a");
        a.href = url;
        a = a.pathname.split("/");
        a.splice(-2, 1);
        return a.join("/") || null;
    }
};

var utils = {
    inject_css: function (code) {
        var s = document.createElement("style");
        s.type = "text/css";
        s.innerHTML = code;
        document.head.appendChild(s);

    },
    inject_script: function (code, afterBody) {
        var s = document.createElement("script");
        s.type = "text/javascript";
        s.innerHTML = code;
        if (true === afterBody) {
            document.body.appendChild(s);
        } else {
            document.head.appendChild(s);
        }
    }
};

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};