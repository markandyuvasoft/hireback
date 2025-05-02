import mongoose from "mongoose";


const authPortfolioSchema = new mongoose.Schema({

    authId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Auth"
    },

    portfolioImage : {
        url: { type: String },
        public_id: { type: String }
    },

    folioTitle : {
        type : String
    },

    description : {
        type : String
    }

},{timestamps : true})

const Portfolio = mongoose.model("Portfolio", authPortfolioSchema)

export default Portfolio