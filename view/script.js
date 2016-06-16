

var default_document = $('span.default_document').text();
$('span.default_document').remove();

var rows;
rows = parse_document(default_document);
rows = sort_by_directory(rows);
$("title").text("Index of " + document.location.pathname + "by Apaxy 2");


var $sample_row = $("tr.odd_even").detach();

var parent_dir = document.location.pathname.match(/^(.*\/)[^/]*\/$/);
if (parent_dir !== null) {
    var $row = $sample_row.clone();
    $row.removeClass("odd_even").addClass("parent");
    $row.find(">td.indexcolicon>img").attr('src', "icons/folder-home.png");
    $row.find(">td.indexcolname>a").text("Parent Directory");
    $row.find(">td.indexcolname>a").attr("href", parent_dir[1]);
    $("#indexlist").append($row);
}

$.each(rows, function (index, row) {
    var $row = $sample_row.clone();
    if (0 === index % 2) {
        $row.removeClass("odd_even").addClass("even");
    } else {
        $row.removeClass("odd_even").addClass("odd");
    }

    $row.find(">td.indexcolname>a").text(row.Name);
    $row.find(">td.indexcolname>a").attr("href", row.Name);
    $row.find(">td.indexcollastmod").text(row.LastModified);
    $row.find(">td.indexcolsize").text(row.Size !== "" ? row.Size : "-");

    if (true === row.IsDir) {
        $row.find(">td.indexcolicon>img").attr('src', get_icon("folder"));
    } else if ("" !== get_extension(row.Name)) {
        $row.find(">td.indexcolicon>img").attr('src', get_icon(get_extension(row.Name)));
    } else {
        $row.find(">td.indexcolicon>img").attr('src', get_icon("default"));
    }

    $("#indexlist").append($row);
});