const Group = require("../models/Group");

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already in the group" });
    }

    // Add user to group members
    group.members.push(req.user.id);
    await group.save();

    res.json({ message: "Joined group", group });
  } catch (err) {
    console.error("Join group error:", err);
    res.status(500).json({ message: "Error joining group" });
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
