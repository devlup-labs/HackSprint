import TeamModel from "../models/team.js";
import UserModel from "../models/user.models.js";
import RegisteredParticipantsModel from "../models/registeredParticipants.js";
import hackathonModel from "../models/hackathon.models.js";

const generateCode = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createTeam = async (req, res) => {
  try {
    const {
      name,
      leaderName,
      leaderEmail,
      hackathon,
      contactNumber,
      city,
      state,
      workEmailAddress,
      yearsOfExperience,
    } = req.body;

    const leader = req.user._id;

    const userDoc = await UserModel.findById(leader);

    const alreadyInTeam = userDoc?.teams?.some(
      (t) => String(t.hackathon) === String(hackathon)
    );

    if (alreadyInTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already in a team for this hackathon",
      });
    }

    let code;
    let exists = true;
    while (exists) {
      code = generateCode(8);
      exists = await TeamModel.findOne({ secretCode: code });
    }

    const existingTeam = await TeamModel.findOne({ name, hackathon });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "Team name already taken",
      });
    }

    const alreadyRegisteredLeader = await RegisteredParticipantsModel.findOne({
      user: leader,
      hackathon,
    });

    if (alreadyRegisteredLeader) {
      return res.status(400).json({
        success: false,
        message: "Leader already registered for this hackathon",
      });
    }

    const team = await TeamModel.create({
      name,
      leader,
      leaderName,
      leaderEmail,
      hackathon,
      members: [],
      secretCode: code,
      secretLink: `${process.env.FRONTEND_URL}/join/${code}`,
    });

    await UserModel.findByIdAndUpdate(leader, {
      $addToSet: {
        registeredHackathons: hackathon,
        leaderOfHackathons: hackathon,
        teams: {
          hackathon: hackathon,
          team: team._id,
        },
      },
    });

    await hackathonModel.findByIdAndUpdate(hackathon, {
      $addToSet: { registeredParticipants: leader },
      $inc: { numParticipants: 1 },
    });

    await RegisteredParticipantsModel.create({
      user: leader,
      hackathon,
      team: team._id,
      name: leaderName,
      contactNumber,
      yearsOfExperience,
      workEmailAddress,
      city,
      state,
    });

    return res.status(201).json({
      secretCode: code,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    if (!userId || !code) {
      return res.status(400).json({ message: "Code is required!" });
    }

    const team = await TeamModel.findOne({ secretCode: code });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const hackathonId = team.hackathon;

    const isAlreadyMember = team.members.some(
      (id) => id.toString() === userId.toString()
    );

    const isPending = team.pendingMembers.some(
      (id) => id.toString() === userId.toString()
    );

    if (isAlreadyMember || isPending) {
      return res.status(400).json({
        message: "Already requested or already a member",
      });
    }

    const userDoc = await UserModel.findById(userId);

    const alreadyInTeam = userDoc?.teams?.some(
      (t) => String(t.hackathon) === String(hackathonId)
    );

    if (alreadyInTeam) {
      return res.status(400).json({
        message: "You are already in a team for this hackathon",
      });
    }

    const alreadyRegistered = await RegisteredParticipantsModel.findOne({
      user: userId,
      hackathon: hackathonId,
    });

    if (alreadyRegistered) {
      return res.status(400).json({
        message: "Already registered for this hackathon",
      });
    }

    team.pendingMembers.push(userId);
    await team.save();

    return res.json({ message: "Request sent to leader for approval" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const handleRequests = async (req, res) => {
  try {
    const { teamCode, action, userId } = req.body;

    if (!teamCode || !userId || !action) {
      return res.status(400).json({
        message: "teamCode, userId and action are required",
      });
    }

    const team = await TeamModel.findOne({ secretCode: teamCode });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    team.pendingMembers = team.pendingMembers.filter(
      (id) => id.toString() !== userId.toString()
    );

    if (action === "accept") {
      const hackathonId = team.hackathon;

      if (team.members.includes(userId)) {
        return res.status(400).json({ message: "User already a member" });
      }
      if (team.members.length + 1 >= team.maxTeamSize) {
        return res.status(400).json({ message: "Team is full" });
      }

      const userDoc = await UserModel.findById(userId);
      if (!userDoc) {
        return res.status(404).json({ message: "User not found" });
      }

      const alreadyInTeam = userDoc?.teams?.some(
        (t) => String(t.hackathon) === String(hackathonId)
      );

      if (alreadyInTeam) {
        return res.status(400).json({
          message: "User already in a team for this hackathon",
        });
      }
      const alreadyRegisteredMember = await RegisteredParticipantsModel.findOne(
        {
          user: userId,
          hackathon: hackathonId,
        }
      );

      if (alreadyRegisteredMember) {
        return res.status(400).json({
          message: "Member already registered for this hackathon",
        });
      }

      team.members.push(userId);
      await UserModel.findByIdAndUpdate(userId, {
        $addToSet: {
          teams: {
            hackathon: hackathonId,
            team: team._id,
          },
          registeredHackathons: hackathonId,
        },
      });

      await RegisteredParticipantsModel.create({
        user: userId,
        hackathon: hackathonId,
        team: team._id,
        name: userDoc.name || "",
        contactNumber: userDoc.contactNumber || "",
        email: userDoc.email || "",
        college: userDoc.college || "",
        gender: userDoc.gender || "",
        currentYearOfStudy: userDoc.currentYearOfStudy || "",
        city: userDoc.city || "",
        state: userDoc.state || "",
        yearsOfExperience: userDoc.yearsOfExperience || "",
        workEmailAddress: userDoc.workEmailAddress || "",
      });

      await hackathonModel.findByIdAndUpdate(hackathonId, {
        $addToSet: { registeredParticipants: userId },
        $inc: { numParticipants: 1 },
      });
    }

    await team.save();

    return res.json({ message: `User ${action}ed successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const searchTeamByCode = async (req, res) => {
  try {
    const { secretCode } = req.params;

    const team = await TeamModel.findOne({ secretCode })
      .populate("leader") //, "name email")
      .populate("members") //, "name email rollNo phone branch year")   // populate members
      .populate("pendingMembers"); //, "name email rollNo phone branch year"); // populate pending requests

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
      message: "Team found successfully",
      team: {
        id: team._id,
        name: team.name,
        code: team.secretCode,
        leader: team.leader,
        members: team.members,
        pendingMembers: team.pendingMembers,
        membersCount: team.members.length,
        pendingRequestsCount: team.pendingMembers.length,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        secretLink: team.secretLink,
        maxTeamSize: team.maxTeamSize,
      },
    });
  } catch (error) {
    console.error("Error searching team:", error);
    res.status(500).json({
      message: "Something went wrong while searching the team!",
      error: error.message,
    });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { teamCode } = req.body;
    const userId = req.user._id;

    if (!teamCode) {
      return res.status(400).json({ message: "Team code is required" });
    }

    // Find team using secretCode
    const team = await TeamModel.findOne({ secretCode: teamCode }).populate(
      "pendingMembers"
    );

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (String(team.leader) !== String(req.user._id)) {
      return res.status(403).json({
        message: "Only team leader can view pending requests",
      });
    }

    return res.json(team.pendingMembers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await TeamModel.findById(teamId)
      .populate("leader")
      .populate("members")
      .populate("pendingMembers")
      .populate("hackathon");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    return res.status(200).json({
      message: "Team found successfully",
      team: {
        id: team._id,
        name: team.name,
        code: team.secretCode,
        leader: team.leader,
        members: team.members,
        pendingMembers: team.pendingMembers,
        membersCount: team.members.length,
        pendingRequestsCount: team.pendingMembers.length,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        secretLink: team.secretLink,
        maxTeamSize: team.maxTeamSize,
        hackathon: team.hackathon,
      },
    });
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    res.status(500).json({
      message: "Something went wrong while fetching the team!",
      error: error.message,
    });
  }
};
