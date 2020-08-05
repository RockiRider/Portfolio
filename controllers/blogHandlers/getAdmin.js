const Post = require('../../database/models/Post')

module.exports = async (req, res) => {
    let sort = {'createdAt':-1}
    const posts = await Post.find({}).sort(sort);
    res.render("admin", {
        posts,
    });
};