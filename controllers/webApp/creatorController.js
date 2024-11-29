module.exports.getUploadVideo = (req, res, next) => {
  context = {
    pageTile: "Upload video",
    pageHeader: "Upload video",
    errorMessages: JSON.stringify(req.flash("errors") ?? []),
    successMessages: JSON.stringify(req.flash("successes") ?? []),
    action: "\\tem",
    title: "",
    description: "",
  };
  res.render("creator/creator.ejs", context);
};
