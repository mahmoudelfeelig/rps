const Service = require("../models/Service");
const User = require("../models/User");
const { positiveMoney } = require('../utils/inputValidation');

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
    const cleanPrice = positiveMoney(price, { min: 1, max: 1000000 });
    if (!cleanPrice) return res.status(400).json({ message: "Invalid price" });
    const newService = new Service({
      title,
      description,
      price: cleanPrice,
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

exports.updateServiceById = async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;
  const cleanPrice = positiveMoney(price, { min: 1, max: 1000000 });
  if (!cleanPrice) return res.status(400).json({ message: "Invalid price" });
  const service = await Service.findOneAndUpdate(
    { _id: id, provider: req.user.id, buyer: null },
    { title, description, price: cleanPrice },
    { new: true, runValidators: true }
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
    if (!Number.isFinite(service.price) || service.price <= 0) {
      return res.status(400).json({ message: "Invalid service price." });
    }

    const debit = await User.updateOne(
      { _id: req.user.id, balance: { $gte: service.price } },
      { $inc: { balance: -service.price } }
    );
    if (debit.modifiedCount !== 1) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    const purchased = await Service.findOneAndUpdate(
      { _id: service._id, buyer: null },
      { $set: { buyer: req.user.id, purchasedAt: new Date() } },
      { new: true }
    )
      .populate("provider")
      .populate("buyer", "username profileImage");

    if (!purchased) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { balance: service.price } });
      return res.status(409).json({ message: "Service already purchased." });
    }

    await User.findByIdAndUpdate(service.provider._id, { $inc: { balance: service.price } });

    console.log("After purchase:", {
      serviceId: purchased._id,
      buyer: purchased.buyer,
      provider: service.provider._id,
      price: service.price
    });

    res.json({ message: "Service purchased successfully", service: purchased });
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
