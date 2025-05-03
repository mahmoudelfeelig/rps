const Group = require("../models/Group");
const User = require("../models/User");

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newGroup = new Group({
      name,
      description,
      createdBy: req.user.id,
      members: [],
      isApproved: true
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    console.error("Create group error:", err);
    res.status(500).json({ message: "Error creating group" });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already in the group" });
    }

    // Optional: prevent joining multiple groups
    const user = await User.findById(req.user.id);
    if (user.group) {
      return res.status(400).json({ message: "Already in a group" });
    }

    group.members.push(req.user.id);
    await group.save();

    user.group = group._id;
    await user.save();

    res.json({ message: "Joined group", group });
  } catch (err) {
    console.error("Join group error:", err);
    res.status(500).json({ message: "Error joining group" });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.group) return res.status(400).json({ message: "Not in a group" });

    const group = await Group.findById(user.group);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter(memberId => memberId.toString() !== user._id.toString());
    await group.save();

    user.group = null;
    await user.save();

    res.json({ message: "Left group" });
  } catch (err) {
    console.error("Leave group error:", err);
    res.status(500).json({ message: "Error leaving group" });
  }
};


exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({ isApproved: true }).select("name description createdBy");
    res.json(groups);
  } catch (err) {
    console.error("Get groups error:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
};

exports.getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "username")
      .populate("createdBy", "username");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error("Group detail error:", err);
    res.status(500).json({ message: "Error fetching group details" });
  }
};
