const { Op } = require('sequelize');
const db = require('../models');

exports.list = async (req, res) => {
  try {
    const { status, property_type, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (property_type) where.property_type = property_type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ];
    }

    const properties = await db.Property.findAll({
      where,
      include: [
        { model: db.PropertyImage },
        { model: db.User, as: 'propertyAgent', attributes: ['id', 'full_name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const stats = {
      total: properties.length,
      available: properties.filter(p => p.status === 'available').length,
      reserved: properties.filter(p => p.status === 'reserved').length,
      sold: properties.filter(p => p.status === 'sold').length,
    };

    res.json({ properties, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const property = await db.Property.findByPk(req.params.id, {
      include: [
        { model: db.PropertyImage },
        { model: db.User, as: 'propertyAgent', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: db.User, as: 'propertyCreator', attributes: ['id', 'full_name'] },
      ],
    });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, price, location, state, city, property_type, bedrooms, bathrooms, land_size, assigned_to, images } = req.body;

    const property = await db.Property.create({
      title, description, price, location, state, city,
      property_type, bedrooms, bathrooms, land_size,
      assigned_to, created_by: req.user.id,
    });

    if (images && images.length > 0) {
      await db.PropertyImage.bulkCreate(
        images.map((url, i) => ({
          property_id: property.id,
          image_url: url,
          is_primary: i === 0,
        }))
      );
    }

    res.status(201).json({ message: 'Property created.', id: property.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const property = await db.Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found.' });

    const { title, description, price, location, state, city, property_type, bedrooms, bathrooms, land_size, status, assigned_to } = req.body;
    await property.update({
      title, description, price, location, state, city,
      property_type, bedrooms, bathrooms, land_size, status, assigned_to,
    });

    res.json({ message: 'Property updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const property = await db.Property.findByPk(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    await property.destroy();
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const url = `/uploads/${req.file.filename}`;
    const propertyId = req.params.id;

    const count = await db.PropertyImage.count({ where: { property_id: propertyId } });

    await db.PropertyImage.create({
      property_id: propertyId,
      image_url: url,
      is_primary: count === 0,
    });

    res.json({ message: 'Image uploaded.', url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
