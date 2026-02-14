(function () {
  var searchInput = document.getElementById("search-input");
  var notesList = document.getElementById("notes-list");
  var notesCount = document.getElementById("notes-count");
  var filterChips = document.querySelectorAll(".filter-chip");

  if (!notesList) return;

  var cards = Array.from(notesList.querySelectorAll(".note-card"));
  var activeProject = "all";
  var activeTags = {};

  var cardData = cards.map(function (card) {
    return {
      el: card,
      title: (card.querySelector(".note-card-title") || {}).textContent.toLowerCase(),
      project: card.dataset.project || "",
      tags: (card.dataset.tags || "").split(",").filter(Boolean),
      body: (card.dataset.body || "").toLowerCase(),
    };
  });

  function applyFilters() {
    var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    var visible = 0;
    var activeTagKeys = Object.keys(activeTags);

    cardData.forEach(function (d) {
      var show = true;

      if (activeProject !== "all" && d.project !== activeProject) show = false;

      if (activeTagKeys.length > 0) {
        for (var i = 0; i < activeTagKeys.length; i++) {
          if (d.tags.indexOf(activeTagKeys[i]) === -1) {
            show = false;
            break;
          }
        }
      }

      if (query && show) {
        var haystack = d.title + " " + d.project + " " + d.tags.join(" ") + " " + d.body;
        if (haystack.indexOf(query) === -1) show = false;
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
      var projectFilter = chip.dataset.filterProject;
      var tagFilter = chip.dataset.filterTag;

      if (projectFilter !== undefined) {
        activeProject = projectFilter;
        document.querySelectorAll("[data-filter-project]").forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");
      }

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
