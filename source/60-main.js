if (parser.is_directory_listing(document.documentElement.innerHTML)) {
  window.stop();

  apaxy2.view_dir = apaxy2.baseURL;
  apaxy2.icon_dir = apaxy2.view_dir + "icons/";
  apaxy2.current_dir = media.get_current_dir(document.location.href);
  apaxy2.parent_dir = media.get_parent_dir(document.location.href);

  var rows = parser.parse_document(document.documentElement.outerHTML);
  rows = parser.sort_rows(rows);

  document.documentElement.innerHTML = resources['base.htm'];
  utils.inject_css(resources['style_apaxy.css']);
  utils.inject_css(resources['style.css']);
  $("title").text("Index of " + document.location.pathname + " by Apaxy 2");

  var $sample_row = $('.wrapper-listing tr.sample').detach().removeClass("sample");
  if (apaxy2.parent_dir !== null) {
    var $row = $sample_row.clone();
    $row.addClass("parent");
    $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + "folder-home.png");
    $row.find(">td.indexcolname>a").text("Parent Directory");
    $row.find(">td.indexcolname>a").attr("href", apaxy2.parent_dir);
    $(".wrapper-listing #indexlist").append($row);
  }

  $.each(rows, function (index, row) {
    var $row = $sample_row.clone();
    $row.find(">td.indexcolname>a").text(row.Name);
    $row.find(">td.indexcolname>a").attr("href", apaxy2.current_dir + row.Path);
    $row.find(">td.indexcollastmod").text(row.LastModified !== "" ? row.LastModified : "-");
    $row.find(">td.indexcolsize").text(row.Size !== "" ? row.Size : "-");

    if (true === row.IsDir) {
      $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + "folder.png");
    } else if ("" !== media.get_extension(row.Path)) {
      $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + media.get_icon(row.Path));
    } else {
      $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + "default.png");
    }

    $(".wrapper-listing #indexlist").append($row);
  });


  (null !== apaxy2.parent_dir) && $.get(apaxy2.parent_dir, function (response) {
    if (parser.is_directory_listing(response)) {
      var rows = parser.parse_document(response);
      var $sample_row = $('.wrapper-tree tr.sample').detach().removeClass("sample");

      var $row = $sample_row.clone();
      $row.addClass("parent");
      $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + "folder-home.png");
      $row.find(">td.indexcolname>a").text("Parent Directory");
      $row.find(">td.indexcolname>a").attr("href", apaxy2.parent_dir);
      $(".wrapper-tree #indexlist").append($row);

      $.each(rows, function (index, row) {
        if (true === row.IsDir) {
          var $row = $sample_row.clone();
          if (apaxy2.current_dir === apaxy2.parent_dir + row.Path) {
            $row.addClass('selected').find(">td.indexcolname>a").html($("<b>").text(row.Name));
          } else {
            $row.find(">td.indexcolname>a").text(row.Name);
          }
          $row.find(">td.indexcolicon>img").attr('src', apaxy2.icon_dir + "folder.png");
          $row.find(">td.indexcolname>a").attr("href", apaxy2.parent_dir + row.Path);
          $(".wrapper-tree #indexlist").append($row);
        }
      });
      $(".wrapper-tree").css("display", "block");
    }
  });

  if ($(".wrapper-listing tr:has(td)").length > 0) {
    $(".wrapper-listing table").addClass("focused");
    $(".wrapper-listing tr:has(td)").eq(0).addClass("selected");
    $(document).on("keydown", function (e) {
      var $selection;
      $selection = $("table.focused .selected");

      if (KeyCode(e, KeyCode.RETURN, /^c?$/)) {
        if (KeyCode(e, [], "c")) {
          window.open($selection.find('a').prop('href'));
        } else {
          document.location = $selection.find('a').prop('href');
        }
        e.preventDefault();
      }

      if (KeyCode(e, KeyCode.TAB, /^s?$/)) {
        if ("block" === $(".wrapper-tree").css("display")) {
          if (1 === $('.wrapper-listing table.focused').length) {
            $('.wrapper-listing table.focused').removeClass("focused");
            $(".wrapper-tree table").addClass("focused");
            if (0 === $('.wrapper-tree table.focused tr.selected').length) {
              $('.wrapper-tree table.focused tr:has(td):eq(0)').addClass("selected");
            }
          } else {
            $('.wrapper-tree table.focused').removeClass("focused");
            $(".wrapper-listing table").addClass("focused");
          }
          utils.scrollToElement($('table.focused tr.selected'));
          e.preventDefault();
        }
      }

      if (KeyCode(e, [KeyCode.UP, KeyCode.DOWN], "")) {
        if (KeyCode(e, KeyCode.UP) && $selection.prev("tr:has(td)").length !== 0) {
          $selection.removeClass("selected").prev().addClass("selected");
        }
        if (KeyCode(e, KeyCode.DOWN) && $selection.next("tr:has(td)").length !== 0) {
          $selection.removeClass("selected").next().addClass("selected");
        }
        utils.scrollToElement($('table.focused tr.selected'));
        e.preventDefault();
      }
    });
  }
}
