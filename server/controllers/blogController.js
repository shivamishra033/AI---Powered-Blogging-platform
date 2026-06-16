import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import generateContent from "../configs/gemini.js";

export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog,
    );
    const imageFile = req.file;

    // Check if all field are present
    if (!title || !description || !category || !imageFile) {
      return req.json({ success: false, message: "Missing required fields" });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    // Upload image to imageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    // Optimization of the image through ImageKiT API
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      tranformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });
    const image = optimizedImageUrl;
    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished,
    });

    res.json({ success: true, message: "Blog added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true });
    res.json({ success: true, blogs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.findByIdAndDelete(id);

    //Delete all comment associated with blog
    await Comment.deleteMany({blog: id});

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;
    const blog = await Blog.findById(id);
    blog.isPublished = !blog.isPublished;
    await blog.save();
    res.json({ success: true, message: "Blog status updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;
    await Comment.create({blog, name, content});
    res.json({ success: true, message: "Comment added for review" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;
    const comments = await Comment.find({ blog: blogId, isApproved: true }).sort
    ({createdAt: -1});
    res.json({ success: true, comments });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const generateBlogContent = async (req, res) => {
  try {
    console.log('Body:', req.body);
    const { title } = req.body;

    if (!title) {
      return res.json({ success: false, message: "Title is required" });
    }

    const prompt = `Write a detailed, well-structured blog post about "${title}". 
    Format it with proper HTML tags like <h2>, <p>, <ul>, <li>, <strong> etc. 
    Make it engaging, informative and at least 500 words.`;

    const content = await generateContent(prompt);

    res.json({ success: true, content });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};