import mongoose from "mongoose"
import express from 'express'
import UserModel from "../models/user.models.js"
import hackathonModel from "../models/hackathon.models.js"
import TeamModel from "../models/team.js"
import RegisteredParticipantsModel from "../models/registeredParticipants.js"
import { all } from "axios"


export const registerParicipants = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const { name, contactNumber, college , gender , currentYearOfStudy, email, currentLocation, yearsOfExperience, workEmailAddress, teamId } = req.body;
        const userId = req.user._id;

        const alreadyRegistered = await RegisteredParticipantsModel.findOne({
            user: userId,
            hackathon: hackathonId
        });

        if (alreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: "User is already registered for this hackathon"
            });
        }
        // create new registration
        const registration = await RegisteredParticipantsModel.create({
            user: userId,
            hackathon: hackathonId,
            team: teamId || null,
            name,
            contactNumber,
            college,
            currentYearOfStudy,
            gender,
            currentLocation,
            email,
            workEmailAddress,
            yearsOfExperience
        });

        // update user
        await UserModel.findByIdAndUpdate(userId, {
            $addToSet: { registeredHackathons: hackathonId }
        });

        // update hackathon
        await hackathonModel.findByIdAndUpdate(hackathonId, {
            $addToSet: { registeredParticipants: registration._id },
            $inc: { numParticipants: 1 }
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            registration
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export const isregistered = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.user._id;

        const hackathonObjectId = new mongoose.Types.ObjectId(hackathonId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const registration = await RegisteredParticipantsModel.findOne({
            hackathon: hackathonId,
            user: userId
        });

        res.json({
            isRegistered: !!registration,
            registration
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const registerTeam = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const {
      teamName,
      leaderId,
      workEmailAddress,
      yearsOfExperience,
      leadEmail,
      leadName,
      teamMembers 
    } = req.body;

    // ✅ Step 0: check leader exists
    const leader = await UserModel.findById(leaderId);
    if (!leader)
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });

    // ✅ Step 1: Parse members string -> extract only emails
    const membersArray = teamMembers.split(",").map((m) => m.trim());
    const memberEmails = [];
    for (let i = 0; i < membersArray.length; i++) {
      if (i % 2 !== 0) memberEmails.push(membersArray[i]); // take only emails
    }

    // ✅ Step 2: Find users by email
    const memberUsers = await UserModel.find({ email: { $in: memberEmails } });
    if (memberUsers.length !== memberEmails.length) {
      return res.status(404).json({
        success: false,
        message: "Some team members are not registered users",
      });
    }
    const memberIds = memberUsers.map((u) => u._id);

    // ✅ Step 3: ensure team name not already taken in this hackathon
    const existingTeam = await TeamModel.findOne({
      name: teamName,
      hackathon: hackathonId,
    });
    if (existingTeam) {
      return res
        .status(400)
        .json({ success: false, message: "Team name already taken" });
    }

    // ✅ Step 4: check if leader already registered
    const alreadyRegisteredLeader = await RegisteredParticipantsModel.findOne({
      user: leaderId,
      hackathon: hackathonId,
    });
    if (alreadyRegisteredLeader) {
      return res.status(400).json({
        success: false,
        message: "Leader already registered for this hackathon",
      });
    }

    // ✅ Step 5: check if any member already registered
    for (let m of memberIds) {
      const already = await RegisteredParticipantsModel.findOne({
        user: m,
        hackathon: hackathonId,
      });
      if (already) {
        return res.status(400).json({
          success: false,
          message: `User ${m} is already registered for this hackathon`,
        });
      }
    }

    // ✅ Step 6: create the team
    const team = await TeamModel.create({
      name: teamName,
      leaderName: leadName,
      leaderEmail: leadEmail,
      leader: leaderId,
      members: memberIds,
      hackathon: hackathonId,
    });

    const registrations = [];

    // ✅ Step 7: create registration entries for leader + members
    const allUsers = [leaderId, ...memberIds];
    for (let uid of allUsers) {
      const reg = await RegisteredParticipantsModel.create({
        user: uid,
        hackathon: hackathonId,
        team: team._id,
        workEmailAddress,
        yearsOfExperience,
      });

      registrations.push(reg);

      await UserModel.findByIdAndUpdate(uid, {
        $addToSet: { registeredHackathons: hackathonId },
      });
    }

    // ✅ Step 8: update hackathon
    await hackathonModel.findByIdAndUpdate(hackathonId, {
      $addToSet: { registeredParticipants: registrations.map((r) => r._id) },
      $inc: { numParticipants: registrations.length },
    });

    res.status(201).json({
      success: true,
      message: "Team registered successfully",
      team,
      registrations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};