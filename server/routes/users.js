const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

function serializeUser(user) {
    if (!user) {
        return null;
    }

    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profile_image: user.profile_image || ''
    };
}

async function serializePost(post, commentCount = null) {
    const count = commentCount !== null ? commentCount : await Comment.countDocuments({ post: post._id });

    return {
        id: post._id.toString(),
        title: post.title,
        body: post.body,
        image: post.image || '',
        tags: Array.isArray(post.tags) ? post.tags.map((tag) => ({ name: tag.name })) : [],
        author: serializeUser(post.user),
        comments_count: count,
        created_at: post.createdAt
    };
}

async function getUserOr400(userId, res) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: 'Invalid user id' });
        return null;
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return null;
    }

    return user;
}

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    try {
        const user = await getUserOr400(req.params.id, res);
        if (!user) {
            return;
        }

        const posts = await Post.find({ user: user._id }).select('_id');
        const postIds = posts.map((post) => post._id);

        const commentsCount = postIds.length > 0
            ? await Comment.countDocuments({ post: { $in: postIds } })
            : 0;

        res.json({
            data: {
                ...serializeUser(user),
                posts_count: postIds.length,
                comments_count: commentsCount
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users/:id/posts
router.get('/:id/posts', async (req, res) => {
    try {
        const user = await getUserOr400(req.params.id, res);
        if (!user) {
            return;
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username email profile_image');

        const data = await Promise.all(
            posts.map(async (post) => {
                const commentCount = await Comment.countDocuments({ post: post._id });
                return serializePost(post, commentCount);
            })
        );

        res.json({
            data,
            meta: {
                total: data.length
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;