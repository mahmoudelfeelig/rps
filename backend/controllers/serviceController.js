const Service = require("../models/Service");
const User = require("../models/User");

exports.createService = async (req, res) => {
  try {
    const existing = await Service.findOne({ provider: req.user.id, finalized: false });
    const waitingConfirmation = await Service.findOne({
      provider: req.user.id,
      finalized: true,
      buyerAccepted: false
    });
    if (existing || waitingConfirmation) return res.status(400).json({ message: "You already have a pending or unconfirmed service." });

    const { title, description, price } = req.body;
    const newService = new Service({
      title,
      description,
      price,
      provider: req.user.id
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.finalizeService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { 
        _id: req.body.serviceId,
        provider: req.user.id,
        finalized: false 
      },
      { finalized: true},
      { new: true }
    );
    

    if (!service) return res.status(404).json({ message: "Service not found or already finalized" });
    res.json(service);
  } catch (err) {
    console.error("Finalize service error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/services/:id
exports.deleteServiceById = async (req, res) => {
  const { id } = req.params;
  const service = await Service.findOneAndDelete({
    _id: id,
    provider: req.user.id,
    buyer: null
  });
  if (!service) return res.status(404).json({ message: "Cannot delete" });
  res.json({ message: "Deleted", service });
};

// PUT /api/services/:id
exports.updateServiceById = async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;
  const service = await Service.findOneAndUpdate(
    { _id: id, provider: req.user.id, buyer: null },
    { title, description, price },
    { new: true }
  );
  if (!service) return res.status(404).json({ message: "Cannot update" });
  res.json(service);
};

exports.getAllServices = async (req, res) => {
  try {
    const query = req.query.showAll === 'true' ? {} : { buyer: null };
    const services = await Service.find(query)
    .populate("provider", "username profileImage")
    .populate("buyer", "username profileImage");
    
    res.json(services);
  } catch (err) {
    console.error("Fetch services error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyPurchases = async (req, res) => {
  try {
    const services = await Service.find({ 
      buyer: req.user.id, 
      $or: [{ finalized: false }, { buyerAccepted: false }]
    })
    .populate("provider", "username profileImage")
    .populate("buyer", "username profileImage");
    res.json(services);
  } catch (err) {
    console.error("Get purchases error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyHistory = async (req, res) => {
  try {
    const providerServices = await Service.find({
      provider: req.user.id,
      finalized: true
    })
    .populate("buyer", "username profileImage")
    .populate("provider", "username profileImage");

    const buyerServices = await Service.find({
      buyer: req.user.id,
      finalized: true
    })
    .populate("provider", "username profileImage")
    .populate("buyer", "username profileImage");

    res.json({ asProvider: providerServices, asBuyer: buyerServices });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.buyService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId)
    .populate("provider")
    .populate("buyer", "username profileImage");

    if (!service) return res.status(404).json({ message: "Service not found" });
    if (service.provider._id.equals(req.user.id)) {
      return res.status(400).json({ message: "You cannot buy your own service." });
    }
    if (service.buyer) return res.status(400).json({ message: "Service already purchased." });

    const buyer = await User.findById(req.user.id);
    if (buyer.balance < service.price) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    buyer.balance -= service.price;
    const provider = await User.findById(service.provider._id);
    provider.balance += service.price;

    service.buyer = buyer._id;
    service.purchasedAt = new Date();

    await buyer.save();
    await provider.save();
    await service.save();

    console.log("After purchase:", {
      serviceId: service._id,
      buyer: service.buyer,
      provider: service.provider._id,
      price: service.price
    });

    res.json({ message: "Service purchased successfully", service });
  } catch (err) {
    console.error("Buy service error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.acceptFinalization = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.body.serviceId,
      buyer: req.user.id,
      finalized: true,
      buyerAccepted: false
    });

    if (!service) return res.status(404).json({ message: "Service not ready for acceptance or not found" });

    service.buyerAccepted = true;
    service.completedAt = new Date();
    await service.save();

    res.json({ message: "Service accepted and marked as completed", service });
  } catch (err) {
    console.error("Accept finalization error:", err);
    res.status(500).json({ message: "Server error" });
  }
};