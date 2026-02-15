(function () {
  var searchInput = document.getElementById("search-input");
  var notesList = document.getElementById("notes-list");
  var notesCount = document.getElementById("notes-count");
  var filterChips = document.querySelectorAll(".filter-chip");

  if (!notesList) return;

  var cards = Array.from(notesList.querySelectorAll(".note-card"));
  var activeTags = {};

  var cardData = cards.map(function (card) {
    var bodyEl = card.querySelector(".note-card-body");
    return {
      el: card,
      bodyEl: bodyEl,
      originalHTML: bodyEl ? bodyEl.innerHTML : "",
      project: card.dataset.project || "",
      tags: (card.dataset.tags || "").split(",").filter(Boolean),
      body: bodyEl ? bodyEl.textContent.toLowerCase() : "",
    };
  });

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightText(node, regex) {
    if (node.nodeType === 3) {
      var match = node.nodeValue.match(regex);
      if (match) {
        var span = document.createElement("span");
        var before = node.nodeValue.substring(0, match.index);
        var after = node.nodeValue.substring(match.index + match[0].length);
        span.innerHTML =
          escapeHTML(before) +
          "<mark>" + escapeHTML(match[0]) + "</mark>" +
          escapeHTML(after);
        node.parentNode.replaceChild(span, node);
        // Continue highlighting in the remaining text
        var lastChild = span.lastChild;
        if (lastChild && lastChild.nodeType === 3) {
          highlightText(lastChild, regex);
        }
      }
    } else if (node.nodeType === 1 && node.nodeName !== "MARK") {
      var children = Array.from(node.childNodes);
      for (var i = 0; i < children.length; i++) {
        highlightText(children[i], regex);
      }
    }
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function applyFilters() {
    var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    var visible = 0;
    var activeTagKeys = Object.keys(activeTags);

    cardData.forEach(function (d) {
      var show = true;

      if (activeTagKeys.length > 0) {
        for (var i = 0; i < activeTagKeys.length; i++) {
          if (d.tags.indexOf(activeTagKeys[i]) === -1) {
            show = false;
            break;
          }
        }
      }

      if (query && show) {
        var haystack = d.project + " " + d.tags.join(" ") + " " + d.body;
        if (haystack.indexOf(query) === -1) show = false;
      }

      // Restore original HTML first, then highlight if needed
      if (d.bodyEl) {
        d.bodyEl.innerHTML = d.originalHTML;
        if (query && show) {
          var regex = new RegExp(escapeRegExp(query), "i");
          highlightText(d.bodyEl, regex);
        }
      }

      d.el.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (notesCount) notesCount.textContent = visible;
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var tagFilter = chip.dataset.filterTag;

      if (tagFilter !== undefined) {
        if (activeTags[tagFilter]) {
          delete activeTags[tagFilter];
          chip.classList.remove("active");
        } else {
          activeTags[tagFilter] = true;
          chip.classList.add("active");
        }
      }

      applyFilters();
    });
  });
})();
