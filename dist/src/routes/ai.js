import { Router } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth';
import { ChatModel } from '../models/Chat';
import { ProjectModel } from '../models/Project';
const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
// Generate code (first time)
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { prompt, projectId, existingFiles } = req.body;
        // Save user message
        await ChatModel.create(req.user.id, 'user', prompt, projectId);
        // Determine endpoint based on existingFiles
        const endpoint = existingFiles && existingFiles.length > 0 ? '/refine' : '/generate';
        const mode = endpoint === '/refine' ? 'Refining' : 'Generating';
        console.log(`\n🚀 ${mode} code with ${existingFiles?.length || 0} existing files`);
        console.log(`📍 Calling endpoint: ${AI_SERVICE_URL}${endpoint}`);
        if (existingFiles && existingFiles.length > 0) {
            console.log(`📝 Existing files:`, existingFiles.map((f) => f.path).join(', '));
        }
        // Call AI service
        const response = await axios.post(`${AI_SERVICE_URL}${endpoint}`, {
            prompt,
            existingFiles: existingFiles || null,
        });
        const aiResponse = response.data;
        const summary = aiResponse.summary || 'Code generated successfully';
        // Save only the summary to chat (not the full code)
        await ChatModel.create(req.user.id, 'assistant', summary, projectId);
        // Handle file updates
        if (aiResponse.files && Array.isArray(aiResponse.files)) {
            let finalFiles = aiResponse.files;
            // If refining (existingFiles present), merge with existing files
            if (endpoint === '/refine' && existingFiles && existingFiles.length > 0) {
                console.log(`🔀 Merging ${aiResponse.files.length} modified files with ${existingFiles.length} existing files`);
                // Create map of modified files by path
                const modifiedFilesMap = new Map();
                aiResponse.files.forEach((file) => {
                    modifiedFilesMap.set(file.path, file);
                });
                // Start with all existing files
                finalFiles = existingFiles.map((file) => {
                    // If this file was modified, use the new version
                    if (modifiedFilesMap.has(file.path)) {
                        console.log(`  ✏️ Updated: ${file.path}`);
                        return modifiedFilesMap.get(file.path);
                    }
                    // Otherwise keep the original
                    return file;
                });
                // Add any new files that weren't in existing files
                aiResponse.files.forEach((file) => {
                    const existsInOriginal = existingFiles.some((f) => f.path === file.path);
                    if (!existsInOriginal) {
                        console.log(`  ➕ Added: ${file.path}`);
                        finalFiles.push(file);
                    }
                });
                console.log(`✅ Final file count: ${finalFiles.length}`);
            }
            // Save to database
            if (projectId) {
                await ProjectModel.update(projectId, {
                    files: JSON.stringify(finalFiles),
                });
            }
            else {
                await ProjectModel.create(req.user.id, aiResponse.projectName || 'Untitled Project', aiResponse.description || '', JSON.stringify(finalFiles));
            }
            // Return merged files to frontend
            aiResponse.files = finalFiles;
        }
        res.json(aiResponse);
    }
    catch (error) {
        console.error('AI generation error:', error);
        res.status(500).json({
            message: error.response?.data?.message || 'AI service error',
        });
    }
});
// Chat with AI
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, projectId, context } = req.body;
        // Save user message
        await ChatModel.create(req.user.id, 'user', message, projectId);
        // Call AI service
        const response = await axios.post(`${AI_SERVICE_URL}/chat`, {
            message,
            context,
        });
        const aiResponse = response.data;
        // Save AI response
        await ChatModel.create(req.user.id, 'assistant', aiResponse.response, projectId);
        res.json(aiResponse);
    }
    catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            message: error.response?.data?.message || 'AI service error',
        });
    }
});
// Get chat history
router.get('/chat/history/:projectId', authMiddleware, async (req, res) => {
    try {
        const messages = await ChatModel.findByProjectId(parseInt(req.params.projectId));
        res.json({ messages });
    }
    catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export default router;
//# sourceMappingURL=ai.js.map