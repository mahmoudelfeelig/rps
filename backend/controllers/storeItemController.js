exports.createItem = async (req, res) => {
    try {
      const item = new StoreItem(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating item:", err);
      res.status(500).json({ error: "Failed to create item" });
    }
  };
  