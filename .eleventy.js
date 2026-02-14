module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  // All notes sorted newest first
  eleventyConfig.addCollection("notes", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/notes/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // Unique project names
  eleventyConfig.addCollection("projects", function(collectionApi) {
    const notes = collectionApi.getFilteredByGlob("src/notes/*.md");
    const projects = [...new Set(notes.map(n => n.data.project).filter(Boolean))];
    return projects.sort();
  });

  // Unique tags
  eleventyConfig.addCollection("allTags", function(collectionApi) {
    const notes = collectionApi.getFilteredByGlob("src/notes/*.md");
    const tags = new Set();
    notes.forEach(note => {
      (note.data.tags || []).forEach(tag => tags.add(tag));
    });
    return [...tags].sort();
  });

  eleventyConfig.addFilter("slugify", function(str) {
    return String(str).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("readableDate", function(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("isoDate", function(date) {
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("lower", function(str) {
    return String(str).toLowerCase();
  });

  eleventyConfig.addFilter("striptags", function(str) {
    return String(str).replace(/<[^>]+>/g, "");
  });

  eleventyConfig.addFilter("truncate", function(str, len) {
    str = String(str);
    if (str.length <= len) return str;
    return str.substring(0, len);
  });

  eleventyConfig.addFilter("wordcount", function(str) {
    return String(str).split(/\s+/).filter(Boolean).length;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
