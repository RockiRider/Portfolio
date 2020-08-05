const path = require('path')
const Post = require('../../database/models/Post')
 
module.exports = (req, res) => {
    const {image} = req.files
    let obj = JSON.parse(req.body.content);
    image.mv(path.resolve(__dirname, '../..', 'public/blog/posts', image.name), (error) => {
        Post.create({
            title: req.body.title,
            description: req.body.description,
            subject: req.body.subject,
            content: obj,
            image: `/blog/posts/${image.name}`
        }, (error, post) => {
            res.redirect("/blog");
        });
    })
    module.exports.stored = true;
}