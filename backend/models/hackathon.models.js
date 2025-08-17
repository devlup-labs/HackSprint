// import { array, number, required } from 'joi'
import mongoose from 'mongoose'

const hackathonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String
    },
    description: {
        type: String
    },
    submissions: {
        type: Array
        //No. of participants of a hackathon are equal to submissions array no.of elements.
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    refMaterial: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: {
            values: ["Advanced", "Expert", "Intermediate"]
        }
    },
    category: {
        type: Array,
        // enum : {
        //     values : ["Web Dev" , "AI/ML" , "Blockchain" , "IoT"]
        // }
    },
    prizeMoney: {
        type: Number
    },
    techStackUsed: {
        type: Array,
        // enum : {
        //     values : ["React" , "Node.js","MongoDB" , "Socket.io","Python","TensorFlow" , "OpenAI" , "FastAPI","Solidity" , "Web3.js" , "IPFS","Arduino" , "PostgreSQL"]
        // }
    },
    numParticipants : {
        type : Number
    }
})

hackathonSchema.pre(/^find/, async function (next) {

    const currentTime = new Date(Date.now())
    //mark status:true for active hackathons
    await this.model.updateMany(
        {
            startDate: { $lte: currentTime },
            endDate: { $gte: currentTime }
        },
        {
            status: true
        }
    )

    //mark status : false for inactive hackathons
    await this.model.updateMany(
        {
            endDate: { $lt: currentTime }
        },
        { status: false }
    )


    next();
})
const hackathonModel = mongoose.model("hackathons", hackathonSchema)

export default hackathonModel