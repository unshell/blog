"use strict";

// 移动端导航切换
var navToggle = document.getElementById('site-nav-toggle');
navToggle.addEventListener('click', function () {
  var aboutContent = document.getElementById('nav-content');

  if (!aboutContent.classList.contains('show-block')) {
    aboutContent.classList.add('show-block');
    aboutContent.classList.remove('hide-block');
  } else {
    aboutContent.classList.add('hide-block');
    aboutContent.classList.remove('show-block');
  }
}); // 本地搜索

var searchButton = document.getElementById('search');
var searchField = document.getElementById('search-field');
var searchInput = document.getElementById('search-input');
var searchResultContainer = document.getElementById('search-result-container');
var escSearch = document.getElementById('esc-search');
var beginSearch = document.getElementById('begin-search');
searchField.addEventListener('mousewheel', function (e) {
  e.stopPropagation();
  return false;
}, false);
var searchJson;
var caseSensitive = false;
searchButton.addEventListener('click', function () {
  search();
});
escSearch.addEventListener('click', function () {
  hideSearchField();
});
beginSearch.addEventListener('click', function () {
  var keyword = searchInput.value;

  if (keyword) {
    searchFromKeyWord(keyword);
  } else {
    searchResultContainer.innerHTML = "\n            <div class=\"no-search-result\">\u8F93\u5165\u70B9\u4EC0\u4E48\u5427</div>\n        ";
    return;
  }
});

function toggleSeachField() {
  if (!searchField.classList.contains('show-flex-fade')) {
    showSearchField();
  } else {
    hideSearchField();
  }
}

function showSearchField() {
  searchField.classList.add('show-flex-fade');
  searchInput.focus();
}

function hideSearchField() {
  window.onkeydown = null;
  searchField.classList.remove('show-flex-fade');
}

function searchFromKeyWord(keyword) {
  var result = [];
  var sildeWindowSize = 100;
  var handleKeyword = keyword;

  if (!caseSensitive) {
    handleKeyword = keyword.toLowerCase();
  }

  if (!searchJson) {
    return -1;
  } else {
    searchJson.forEach(function (item) {
      if (!item.title || !item.content) return 0; // break

      var title = item.title.trim();
      var content = item.content.trim().replace(/<[^>]+>/g, "").replace(/[`#\n]/g, "");
      var lowerTitle = title,
          lowerContent = content;

      if (!caseSensitive) {
        lowerTitle = title.toLowerCase();
        lowerContent = content.toLowerCase();
      }

      if (lowerTitle.indexOf(handleKeyword) !== -1 || lowerContent.indexOf(handleKeyword) !== -1) {
        var resultItem = {};
        resultItem.title = title.replace(keyword, "<span class='keyword'>" + keyword + '</span>');
        resultItem.url = item.url;
        resultItem.content = [];
        var lastend = 0;

        while (lowerContent.indexOf(handleKeyword) !== -1) {
          var begin = lowerContent.indexOf(handleKeyword) - sildeWindowSize / 2 < 0 ? 0 : lowerContent.indexOf(handleKeyword) - sildeWindowSize / 2;
          var end = begin + sildeWindowSize;
          var reg = caseSensitive ? new RegExp('(' + keyword + ')', 'g') : new RegExp('(' + keyword + ')', 'ig');
          resultItem.content.push("..." + content.slice(lastend + begin, lastend + end).replace(reg, "<span class='keyword'>$1</span>") + "...");
          lowerContent = lowerContent.slice(end, lowerContent.length);
          lastend = end;
        }

        result.push(resultItem);
      }
    });
  }

  if (!result.length) {
    searchResultContainer.innerHTML = "\n            <div class=\"no-search-result\">\u65E0\u7ED3\u679C</div>\n        ";
    return;
  }

  var searchFragment = document.createElement('ul');

  for (var _i = 0, _result = result; _i < _result.length; _i++) {
    var item = _result[_i];
    var searchItem = document.createElement('li');
    var searchTitle = document.createElement('a');
    searchTitle.href = item.url;
    searchTitle.innerHTML = item.title;
    searchItem.appendChild(searchTitle);

    if (item.content.length) {
      var searchContentLiContainer = document.createElement('ul');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = item.content[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var citem = _step.value;
          var searchContentFragment = document.createElement('li');
          searchContentFragment.innerHTML = citem;
          searchContentLiContainer.appendChild(searchContentFragment);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      searchItem.appendChild(searchContentLiContainer);
    }

    searchFragment.appendChild(searchItem);
  }

  while (searchResultContainer.firstChild) {
    searchResultContainer.removeChild(searchResultContainer.firstChild);
  }

  searchResultContainer.appendChild(searchFragment);
}

function search() {
  toggleSeachField();

  window.onkeydown = function (e) {
    if (e.which === 27) {
      // ESC按下
      toggleSeachField();
    } else if (e.which === 13) {
      // 回车按下
      var keyword = searchInput.value;

      if (keyword) {
        searchFromKeyWord(keyword);
      }
    }
  };

  if (!searchJson) {
    var isXml;
    var search_path = window.hexo_search_path;

    if (search_path.length === 0) {
      search_path = "search.json";
    } else if (/json$/i.test(search_path)) {
      isXml = false;
    }

    var path = window.hexo_root + search_path;
    $.ajax({
      url: path,
      dataType: isXml ? "xml" : "json",
      async: true,
      success: function success(res) {
        searchJson = isXml ? $("entry", res).map(function () {
          return {
            title: $("title", this).text(),
            content: $("content", this).text(),
            url: $("url", this).text()
          };
        }).get() : res;
      }
    });
  }
} // directory function in post pages


function getDistanceOfLeft(obj) {
  var left = 0;
  var top = 0;

  while (obj) {
    left += obj.offsetLeft;
    top += obj.offsetTop;
    obj = obj.offsetParent;
  }

  return {
    left: left,
    top: top
  };
} // 窗口重置监听


window.onresize = function () {
  reHeightToc();
};

var toc = document.getElementById('toc');
var tocToTop = getDistanceOfLeft(toc).top;

function reHeightToc() {
  if (toc) {
    // resize toc height
    toc.style.maxHeight = document.documentElement.clientHeight - 10 + 'px';
    toc.style.overflowY = 'scroll';
  }
}

reHeightToc();

if (window.isPost) {
  var result = [];
  var nameSet = new Set();

  if (!toc || !toc.children || !toc.children[0]) {// do nothing
  } else {
    var reLayout = function reLayout() {
      var scrollToTop = document.documentElement.scrollTop || window.pageYOffset; // Safari is special

      if (tocToTop === 0) {
        // Fix bug that when resize window the toc layout may be wrong
        toc = document.getElementById('toc');
        toc.classList.remove('toc-fixed');
        tocToTop = getDistanceOfLeft(toc).top;
      }

      if (tocToTop <= scrollToTop + 10) {
        if (!toc.classList.contains('toc-fixed')) toc.classList.add('toc-fixed');
      } else {
        if (toc.classList.contains('toc-fixed')) toc.classList.remove('toc-fixed');
      }

      var minTop = 9999;
      var minTopsValue = "";
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = nameArray[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _item = _step2.value;
          var dom = document.getElementById(_item) || document.getElementById(_item.replace(/\s/g, ''));
          if (!dom) continue;
          var toTop = getDistanceOfLeft(dom).top - scrollToTop;

          if (Math.abs(toTop) < minTop) {
            minTop = Math.abs(toTop);
            minTopsValue = _item;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (minTopsValue) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = result[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            if (item.value.indexOf(minTopsValue) !== -1) {
              item.dom.classList.add("active");
            } else {
              item.dom.classList.remove("active");
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    };

    if (toc.children[0].nodeName === "OL") {
      var getArrayFromOl = function getArrayFromOl(ol) {
        var result = [];
        ol.forEach(function (item) {
          if (item.children.length === 1) {
            // TODO: need change
            var value = item.children[0].getAttribute('href').replace(/^#/, "");
            result.push({
              value: [value],
              dom: item
            });
            nameSet.add(value);
          } else {
            var concatArray = getArrayFromOl(Array.from(item.children[1].children));
            nameSet.add(item.children[0].getAttribute('href').replace(/^#/, ""));
            result.push({
              value: [item.children[0].getAttribute('href').replace(/^#/, "")].concat(concatArray.reduce(function (p, n) {
                p = p.concat(n.value);
                return p;
              }, [])),
              dom: item
            });
            result = result.concat(concatArray);
          }
        });
        return result;
      };

      var ol = Array.from(toc.children[0].children);
      result = getArrayFromOl(ol);
    }

    var nameArray = Array.from(nameSet);
    reLayout();
    window.addEventListener('scroll', function (e) {
      reLayout();
    });
  }
} // donate


var donateButton = document.getElementById('donate-button');
var donateImgContainer = document.getElementById('donate-img-container');
var donateImg = document.getElementById('donate-img');

if (donateButton) {
  donateButton.addEventListener('click', function () {
    if (donateImgContainer.classList.contains('hide')) {
      donateImgContainer.classList.remove('hide');
    } else {
      donateImgContainer.classList.add('hide');
    }
  });
  donateImg.src = donateImg.dataset.src;
}