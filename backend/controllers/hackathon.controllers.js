import mongoose from "mongoose";
import express from "express";
import hackathonModel from "../models/hackathon.models.js";
import UserModel from "../models/user.models.js";


export const sendHackathons = async (req, res) => {
  try {
    const allHackathons = await hackathonModel.find({
      status: true,
    });
    res.status(200).json({
      allHackathons,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const sendInactiveHackathons = async (req, res) => {
  try {
    const allHackathons = await hackathonModel.find({
      status: false,
    });
    res.status(200).json({
      allHackathons,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// above code sent all inactive hackathons while below code sent only expired hackathons
export const sendExpiredHackathons = async (req, res) => {
  try {
    const currentTime = new Date(Date.now());
    const expiredHackathons = await hackathonModel.find({
      status: false,
      endDate: { $lt: currentTime },
    });
    res.status(200).json({
      expiredHackathons,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addhackathons = async (req, res) => {
  try {
    const hackathonsdata = new hackathonModel(req.body);
    await hackathonsdata.save();
    res.status(201).json({
      message: "Hackathon Added Successfully",
      data: hackathonsdata,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

export const registerParticipants = async (req, res) => {
  try {
    const { hackathonId } = req.body;
    const userId = req.body.userId; // already injected by verifyAuth

    // Check if hackathonId is valid
    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      return res.status(400).json({ message: "Invalid Hackathon ID" });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Login Required" , isVerified : false});
    }
    
    //  Find hackathon
    const hackathon = await hackathonModel.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Prevent duplicate registration
    // if (hackathon.submissions.includes(user._id.toString())) {
    //   return res.status(400).json({ message: "Already registered" });
    // }

    // Update participants by one
    hackathon.numParticipants = hackathon.numParticipants + 1;

    await hackathon.save();

    res.status(200).json({
      message: "Successfully registered for the hackathon",
      participants: hackathon.numParticipants
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getParticularHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Hackathon ID" });
    }
    const hackathon = await hackathonModel.findById(id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.status(200).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}
export const sendUpcomingHackathons = async (req, res) => {
  try {
    const currentTime = new Date(Date.now());
    const upcomingHackathonsdata = await hackathonModel.find({
      status: false,
      startDate: { $gt: currentTime },
    });

    res.status(200).json({
      upcomingHackathonsdata,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
    res.status(200).json({
      expiredHackathons,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addhackathons = async (req, res) => {
  try {
    const hackathonsdata = new hackathonModel(req.body);
    await hackathonsdata.save();
    res.status(201).json({
      message: "Hackathon Added Successfully",
      data: hackathonsdata,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

export const sendDetailsOfId = async (req, res) => {
  try {
    const detailsOfId = await hackathonModel.findById(req.params.id);
    if (!detailsOfId) {
      res.status(404).json({ message: 'Hackathon not there' });
    }
    res.json(detailsOfId);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
