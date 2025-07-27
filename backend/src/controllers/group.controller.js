import client from "../lib/db.js";
import {ApiError} from "../middlewares/error.js";

export const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.id;
        if (!name) 
            throw new ApiError("Group name is required.", 400);
        
        await client.query('BEGIN');
        const groupResult = await client.query(`
            INSERT INTO groups (name, description, created_by) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [name, description || null, userId]
        );
        
        const group = groupResult.rows[0];
        await client.query(`
            INSERT INTO group_members (group_id, user_id, role) 
            VALUES ($1, $2, $3)`,
            [group.id, userId, 'admin']
        );
        
        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            group: groupResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        next(error);
    }
};

export const sendGroupMessage = async (req, res, next) => {
    try {
        const {groupId} = req.params;
        const {content} = req.body;
        const userId = req.user.id;
        if (!content) 
            throw new ApiError("Message content is required.", 400);
        
        const memberCheck = await client.query(`
            SELECT * FROM group_members 
            WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );
        
        if (memberCheck.rowCount === 0)
            throw new ApiError("You are not a member of this group.", 403);
        
        const result = await client.query(`
            INSERT INTO group_messages (group_id, sender_id, content) 
            VALUES ($1, $2, $3) 
            RETURNING *`,
            [groupId, userId, content]
        );

        res.status(201).json({ 
            success: true, 
            message: result.rows[0] 
        });
    } catch (error) {
        next(error);
    }
};

export const getUserGroupsWithLastMessages = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const groupsResult = await client.query(`
            SELECT g.*,
                json_build_object(
                    'id', s.id,
                    'first_name', s.first_name,
                    'last_name', s.last_name
                ) as sender
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
            ORDER BY g.created_at DESC`,
            [userId]
        );
        
        const groups = groupsResult.rows;
        const groupIds = groups.map(g => g.id);
        let lastMessages = [];
        if (groupIds.length > 0) {
            const lastMsgResult = await client.query(
                `SELECT DISTINCT ON (group_id) * FROM group_messages
                 WHERE group_id = ANY($1)
                 ORDER BY group_id, created_at DESC`,
                [groupIds]
            );
            lastMessages = lastMsgResult.rows;
        }

        const groupsWithLastMsg = groups.map(g => ({
            ...g,
            last_message: lastMessages.find(m => m.group_id === g.id) || null
        }));
        
        res.status(200).json({ 
            success: true, 
            groups: groupsWithLastMsg 
        });
    } catch (error) {
        next(error);
    }
};

export const getGroupMessages = async (req, res, next) => {
    try {
        const {groupId, page, pageSize} = req.params;
        const userId = req.user.id;
        const pageNum = parseInt(page) || 1;
        const size = parseInt(pageSize) || 20;
        const offset = (pageNum - 1) * size;
        const memberCheck = await client.query(`
            SELECT * FROM group_members 
            WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        if (memberCheck.rowCount === 0)
            throw new ApiError("You are not a member of this group.", 403);
        
        const messagesResult = await client.query(`
            SELECT * FROM group_messages 
            WHERE group_id = $1 ORDER BY created_at 
            DESC LIMIT $2 OFFSET $3`,
            [groupId, size, offset]
        );

        res.status(200).json({ 
            success: true, 
            messages: messagesResult.rows 
        });
    } catch (error) {
        next(error);
    }
};

export const getGroupMembers = async (req, res, next) => {
    try {
        const {groupId} = req.params;
        const userId = req.user.id;
        const memberCheck = await client.query(`
            SELECT * FROM group_members 
            WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        if (memberCheck.rowCount === 0)
            throw new ApiError("You are not a member of this group.", 403);
        
        const membersResult = await client.query(`
            SELECT u.id, u.first_name, u.last_name, u.email, gm.role, gm.joined_at
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = $1
            ORDER BY gm.joined_at ASC`,
            [groupId]
        );

        res.status(200).json({ 
            success: true, 
            members: membersResult.rows 
        });
    } catch (error) {
        next(error);
    }
};
