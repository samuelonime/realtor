const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { status, property_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (property_id) where.property_id = property_id;

    const documents = await db.Document.findAll({
      where,
      include: [
        { model: db.Property, attributes: ['id', 'title', 'location'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const stats = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      verified: documents.filter(d => d.status === 'verified').length,
      flagged: documents.filter(d => d.status === 'flagged').length,
    };

    res.json({ documents, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const doc = await db.Document.findByPk(req.params.id, {
      include: [
        { model: db.Property, attributes: ['id', 'title'] },
        { model: db.User, as: 'uploader', attributes: ['id', 'full_name'] },
      ],
    });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { property_id, document_type, title, file_url, notes } = req.body;

    const doc = await db.Document.create({
      property_id, document_type, title, file_url,
      notes, uploaded_by: req.user.id,
    });

    res.status(201).json({ message: 'Document uploaded.', id: doc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await db.Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const { status, notes } = req.body;
    const updateData = { status, notes };
    if (status) updateData.verified_by = req.user.id;

    await doc.update(updateData);
    res.json({ message: 'Document updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doc = await db.Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    await doc.destroy();
    res.json({ message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
