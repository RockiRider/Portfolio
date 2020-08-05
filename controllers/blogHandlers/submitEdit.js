const path = require("path");
const Post = require("../../database/models/Post");
const handlePostController = require("./handlePost");

module.exports = (req, res) => {
    let realId = handlePostController.id;
    var updated = req.body;
    if (!req.files || Object.keys(req).files === 0) {
        Post.findByIdAndUpdate(realId, { title: updated.title, description: updated.description,
            subject: updated.subject,
            content: updated.content }, { new: true }, function (
            err,
            model
        ) {
            if (!err) {
                res.redirect("/admin");
            } else {
                res.redirect("/blog");
            }
        });
    } else {
        let file = req.files.image;
        //console.log("Yes Upload");
        file.mv(path.resolve(__dirname, "../..", "public/blog/posts", file.name), function (err) {
            Post.findByIdAndUpdate(
                realId,
                { title: updated.title, description: updated.description,
                    subject: updated.subject,
                    content: updated.content, image: `/blog/posts/${file.name}` },
                { new: true },
                function (err, model) {
                    if (!err) {
                        res.redirect("/admin");
                    } else {
                        res.redirect("/blog");
                    }
                }
            );
            if (err) {
                //Create Popup Here!!!!!
                console.log("Error with upload");
            }
        });
    }
};
