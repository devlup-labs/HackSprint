import mongoose from "mongoose"
import express from 'express'
import devquestModel from "../models/devquest.model.js"
import { all } from "axios"

export const sendQandA = async (req, res) => {
    try {
        const allQandA = await devquestModel.find();
        res.status(200).json({
            "Questions&Answer": allQandA
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}
export const addQandA = async (req, res) => {
    try {
        const question = new devquestModel(req.body);
        await question.save();
        res.status(201).json({
            "message": "Questions Added Successfully",
            "data": question
        })
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
}