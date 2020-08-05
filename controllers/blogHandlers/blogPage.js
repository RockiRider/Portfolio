const Post = require('../../database/models/Post')

module.exports = async (req, res) => {

    let sort = {'createdAt':-1}
    let posts;
    if (req.query.search != undefined) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        posts = await Post.find({$or:[{ "title": regex},{"subject":regex },{"description":{$regex : regex}},{"content":{$regex : regex}}]}).sort(sort);
    }else{
        posts = await Post.find({}).sort(sort);
    }
    res.render("index", {
        posts
    });  
}   


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};