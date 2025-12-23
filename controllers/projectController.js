import pool from '../src/config/database';
import crypto from 'crypto';
// Parse markdown with file blocks into array of files
function parseMarkdown(markdown) {
    const files = [];
    const fileBlockRegex = /```(\w+)?\s*\n\/\/\s*(.+?)\n([\s\S]*?)```/g;
    let match;
    while ((match = fileBlockRegex.exec(markdown)) !== null) {
        const path = match[2].trim();
        const content = match[3];
        const sha256 = crypto.createHash('sha256').update(content).digest('hex');
        files.push({ path, content, sha256 });
    }
    return files;
}
// Save or create project with generated files
export const saveProject = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { projectId, title, name, files } = req.body;
        // Use title as name if name not provided (for backwards compatibility)
        const projectName = name || title;
        if (!projectName || !files || !Array.isArray(files)) {
            return res.status(400).json({ error: 'Project name/title and files are required' });
        }
        let finalProjectId = projectId;
        // Create or update project
        if (!projectId || projectId === 'new') {
            const [result] = await connection.query('INSERT INTO projects (user_id, name, title, status) VALUES (?, ?, ?, ?)', [userId, projectName, title || projectName, 'draft']);
            finalProjectId = result.insertId;
        }
        else {
            // Check ownership
            const [existing] = await connection.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
            if (existing.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Project not found or access denied' });
            }
            await connection.query('UPDATE projects SET title = ?, updated_at = NOW() WHERE id = ?', [title, projectId]);
        }
        // Get next version number
        const [versionRows] = await connection.query('SELECT MAX(version_number) as max_version FROM versions WHERE project_id = ?', [finalProjectId]);
        const nextVersion = (versionRows[0]?.max_version || 0) + 1;
        // Create new version
        const [versionResult] = await connection.query('INSERT INTO versions (project_id, version_number, summary) VALUES (?, ?, ?)', [finalProjectId, nextVersion, `Generated version ${nextVersion}`]);
        const versionId = versionResult.insertId;
        // Insert all artifacts
        for (const file of files) {
            const sha256 = crypto.createHash('sha256').update(file.content).digest('hex');
            await connection.query('INSERT INTO artifacts (project_id, version_id, file_path, content, sha256) VALUES (?, ?, ?, ?, ?)', [finalProjectId, versionId, file.path, file.content, sha256]);
        }
        // Update project status
        await connection.query('UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?', ['ready', finalProjectId]);
        await connection.commit();
        res.json({
            projectId: finalProjectId,
            version: nextVersion,
            fileCount: files.length
        });
    }
    catch (error) {
        await connection.rollback();
        console.error('Save project error:', error);
        res.status(500).json({ error: error.message || 'Failed to save project' });
    }
    finally {
        connection.release();
    }
};
// Get project with latest version files
export const getProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get project details
        const [projects] = await pool.query('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = projects[0];
        // Get latest version
        const [versions] = await pool.query('SELECT * FROM versions WHERE project_id = ? ORDER BY version_number DESC LIMIT 1', [projectId]);
        if (versions.length === 0) {
            return res.json({ project, files: [] });
        }
        const latestVersion = versions[0];
        // Get all artifacts for latest version
        const [artifacts] = await pool.query('SELECT file_path as path, content FROM artifacts WHERE version_id = ?', [latestVersion.id]);
        res.json({
            project,
            version: latestVersion.version_number,
            files: artifacts
        });
    }
    catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: error.message || 'Failed to get project' });
    }
};
// List all projects for user
export const listProjects = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const [projects] = await pool.query(`SELECT p.*, 
        (SELECT MAX(version_number) FROM versions WHERE project_id = p.id) as latest_version,
        (SELECT COUNT(*) FROM artifacts WHERE project_id = p.id) as file_count
       FROM projects p 
       WHERE p.user_id = ? 
       ORDER BY p.updated_at DESC 
       LIMIT 50`, [userId]);
        res.json(projects);
    }
    catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({ error: error.message || 'Failed to list projects' });
    }
};
// Delete project and all associated data
export const deleteProject = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const [result] = await pool.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
};
// Update project title
export const updateProjectTitle = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { projectId } = req.params;
        const { title } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Check ownership
        const [existing] = await pool.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Update title
        await pool.query('UPDATE projects SET title = ?, updated_at = NOW() WHERE id = ?', [title.trim(), projectId]);
        res.json({ message: 'Title updated successfully', title: title.trim() });
    }
    catch (error) {
        console.error('Update title error:', error);
        res.status(500).json({ error: error.message || 'Failed to update title' });
    }
};
//# sourceMappingURL=projectController.js.map