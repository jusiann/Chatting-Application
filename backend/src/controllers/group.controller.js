import client from "../lib/db.js";
import { ApiError } from "../middlewares/error.js";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

export const createGroup = async (req, res, next) => {
  const { name, description, memberIds } = req.body;
  const creatorId = req.user.id;
  try {
    // Grup oluştur
    const group = await client.query(
      `INSERT INTO groups (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, creatorId]
    );

    const groupId = group.rows[0].id;

    // Grup oluşturucusunu admin olarak ekle
    await client.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [groupId, creatorId]
    );

    // Diğer üyeleri ekle
    for (const memberId of memberIds) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`,
        [groupId, memberId]
      );
    }

    res.status(200).json(group.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Grup oluşturulurken hata oluştu" });
  }
};

export const sendGroupMessage = async (req, res, next) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  try {
    // Kullanıcının gruba üye olup olmadığını kontrol et
    const membership = await client.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, senderId]
    );

    if (membership.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Bu gruba mesaj gönderme yetkiniz yok" });
    }

    const message = await client.query(
      `INSERT INTO group_messages (group_id, sender_id, content) 
             VALUES ($1, $2, $3) RETURNING *`,
      [groupId, senderId, content]
    );

    res.status(200).json(message.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Mesaj gönderilirken hata oluştu" });
  }
};

export const getUserGroupsWithLastMessages = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const groups = await client.query(
      `
            SELECT g.*, gm.role,
                   (SELECT content FROM group_messages 
                    WHERE group_id = g.id 
                    ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT sender_id FROM group_messages 
                    WHERE group_id = g.id 
                    ORDER BY created_at DESC LIMIT 1) as sender_id,
                    (SELECT file_key FROM group_messages 
                    WHERE group_id = g.id 
                    ORDER BY created_at DESC LIMIT 1) as file_key,
                   (SELECT created_at FROM group_messages 
                    WHERE group_id = g.id 
                    ORDER BY created_at DESC LIMIT 1) as last_message_time,
                    (SELECT COUNT(*) FROM group_messages WHERE group_id = g.id and id > COALESCE(gm.last_read_message_id, 0)) as unread_count
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1
            ORDER BY last_message_time DESC
        `,
      [userId]
    );
    const contentMessage = (value) => {
      const userId = req.user.id;
      const isSendedFileMessage = value.file_key && value.sender_id == userId;
      if (isSendedFileMessage) return "Dosya gönderildi";
      const isReceivedFileMessage = value.file_key && value.sender_id != userId;
      if (isReceivedFileMessage) return "Dosya alındı";
      return value.last_message || "Grup Oluşturuldu.";
    };
    const groupsWithLastMessages = groups.rows.map((group) => ({
      ...group,
      last_message: contentMessage(group),
    }));

    res.status(200).json(groupsWithLastMessages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Gruplar getirilirken hata oluştu" });
  }
};

export const getGroupMessages = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  const { isFirst, cursor } = req.query;

  try {
    if (isFirst == "true") {
      // Kullanıcının gruba üye olup olmadığını kontrol et
      console.log("Checking group membership...");
      const membership = await client.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );

      if (membership.rows.length === 0) {
        return res
          .status(403)
          .json({ message: "Bu grubun mesajlarını görme yetkiniz yok" });
      }

      const messages = await client.query(
        `
            SELECT gm.*, u.first_name, u.last_name 
            FROM group_messages gm
            JOIN users u ON gm.sender_id = u.id
            WHERE gm.group_id = $1
            ORDER BY gm.id DESC LIMIT 30
        `,
        [groupId]
      );
      let hasMore = false;
      if (messages.rows.length == 30) hasMore = true;
      let newCursor = null;
      if (messages.rows.length > 0) {
        newCursor = messages.rows[messages.rows.length - 1].id;
      }
      const newMessages = await Promise.all(
        messages.rows.map(async (msg) => {
          if (msg.file_key) {
            const fileUrl = await s3.getSignedUrlPromise("getObject", {
              Bucket: process.env.S3_BUCKET_FILENAME,
              Key: msg.file_key,
              Expires: 600, // 10 dakika geçerli
            });
            msg.file_url = fileUrl;
          }
          return msg;
        })
      );
      res
        .status(200)
        .json({ messages: newMessages, hasMore, cursor: newCursor });
    } else {
      console.log("Checking group membership...");
      const membership = await client.query(
        `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );

      if (membership.rows.length === 0) {
        return res
          .status(403)
          .json({ message: "Bu grubun mesajlarını görme yetkiniz yok" });
      }

      const messages = await client.query(
        `
            SELECT gm.*, u.first_name, u.last_name 
            FROM group_messages gm
            JOIN users u ON gm.sender_id = u.id
            WHERE gm.group_id = $1 AND gm.id < $2
            ORDER BY gm.id DESC LIMIT 30
        `,
        [groupId, cursor]
      );
      let hasMore = false;
      if (messages.rows.length == 30) hasMore = true;
      let newCursor = null;
      if (messages.rows.length > 0) {
        newCursor = messages.rows[messages.rows.length - 1].id;
      }
      const newMessages = await Promise.all(
        messages.rows.map(async (msg) => {
          if (msg.file_key) {
            const fileUrl = await s3.getSignedUrlPromise("getObject", {
              Bucket: process.env.S3_BUCKET_FILENAME,
              Key: msg.file_key,
              Expires: 600, // 10 dakika geçerli
            });
            msg.file_url = fileUrl;
          }
          return msg;
        })
      );
      res
        .status(200)
        .json({ messages: newMessages, hasMore, cursor: newCursor });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Mesajlar getirilirken hata oluştu" });
  }
};

export const getGroupMembers = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    // Kullanıcının gruba üye olup olmadığını kontrol et
    const membership = await client.query(
      `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (membership.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "Bu grubun üyelerini görme yetkiniz yok" });
    }

    const members = await client.query(
      `
            SELECT u.id, u.name, u.surname, u.email, gm.role, gm.joined_at
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = $1
            ORDER BY gm.joined_at
        `,
      [groupId]
    );

    res.status(200).json(members.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Üyeler getirilirken hata oluştu" });
  }
};
