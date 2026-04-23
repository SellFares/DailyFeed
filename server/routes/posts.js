const router = require('express').Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const upload = require('../config/multer');
const Post = require('../models/post');
const Comment = require('../models/comment');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const tokenParts = authHeader.split(' ');
  const token = tokenParts.length === 2 ? tokenParts[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function parseTags(tagsInput) {
  if (!tagsInput) {
    return [];
  }

  if (Array.isArray(tagsInput)) {
    return tagsInput
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }

  if (typeof tagsInput === 'string') {
    return tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }

  return [];
}

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

function serializeComment(comment) {
  return {
    id: comment._id.toString(),
    body: comment.content,
    author: serializeUser(comment.user),
    created_at: comment.createdAt
  };
}

async function serializePost(post, commentCount = null, comments = null) {
  const count = commentCount !== null ? commentCount : await Comment.countDocuments({ post: post._id });

  return {
    id: post._id.toString(),
    title: post.title,
    body: post.body,
    image: post.image || '',
    tags: Array.isArray(post.tags) ? post.tags.map((tag) => ({ name: tag.name })) : [],
    author: serializeUser(post.user),
    comments_count: count,
    comments: comments || [],
    created_at: post.createdAt
  };
}

async function getPostOr404(postId, res) {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    res.status(400).json({ message: 'Invalid post id' });
    return null;
  }

  const post = await Post.findById(postId).populate('user', 'username email profile_image');

  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return null;
  }

  return post;
}

// GET /api/posts?limit=15&page=1
router.get('/', async (req, res) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 15, 1);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
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
        total,
        page,
        limit,
        last_page: Math.max(Math.ceil(total / limit), 1)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await getPostOr404(req.params.id, res);
    if (!post) {
      return;
    }

    const comments = await Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .populate('user', 'username email profile_image');

    const data = await serializePost(
      post,
      comments.length,
      comments.map((comment) => serializeComment(comment))
    );

    res.json({
      data
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/posts
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title = '', body = '', tags } = req.body;
    console.log(req.body)
    if (!body.trim()) {
      return res.status(400).json({ message: 'Body is required' });
    }

    const post = await Post.create({
      title,
      body,
      image: req.file ? req.file.path : '',
      user: req.userId,
      tags: parseTags(tags)
    });

    const populatedPost = await Post.findById(post._id).populate('user', 'username email profile_image');

    res.status(201).json({
      message: 'Post created successfully',
      data: await serializePost(populatedPost, 0, [])
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

async function updatePost(req, res) {
  try {
    const post = await getPostOr404(req.params.id, res);
    if (!post) {
      return;
    }

    if (post.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not allowed to edit this post' });
    }

    const { title, body, tags } = req.body;

    if (title !== undefined) {
      post.title = title;
    }

    if (body !== undefined) {
      if (!body.trim()) {
        return res.status(400).json({ message: 'Body is required' });
      }

      post.body = body;
    }

    if (tags !== undefined) {
      post.tags = parseTags(tags);
    }

    if (req.file) {
      post.image = req.file.path;
    }

    await post.save();

    const populatedPost = await Post.findById(post._id).populate('user', 'username email profile_image');

    res.json({
      message: 'Post updated successfully',
      data: await serializePost(populatedPost)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}

router.put('/:id', authMiddleware, upload.single('image'), updatePost);
router.post('/:id', authMiddleware, upload.single('image'), updatePost);

// POST /api/posts/:id/comments
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const post = await getPostOr404(req.params.id, res);
    if (!post) {
      return;
    }

    const commentBody = req.body.body || req.body.content || '';

    if (!commentBody.trim()) {
      return res.status(400).json({ message: 'Comment body is required' });
    }

    const comment = await Comment.create({
      content: commentBody,
      user: req.userId,
      post: post._id
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username email profile_image');

    res.status(201).json({
      message: 'Comment created successfully',
      data: serializeComment(populatedComment)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await getPostOr404(req.params.id, res);
    if (!post) {
      return;
    }

    if (post.user._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'You are not allowed to delete this post' });
    }

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;