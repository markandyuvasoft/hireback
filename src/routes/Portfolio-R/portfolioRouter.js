import express from "express"
import { AuthPortfolioFound, createPortfolio, deletePortfolio, singlePortfolio, updatePortFolio } from "../../controllers/Portfolio-C/portfolio-controller.js"
import { upload } from "../../common/image.js"


const portfolioRouter = express.Router()

portfolioRouter.post("/createPortfolio/:authId",upload.fields([ { name: "portfolioImage", maxCount: 1 } ]), createPortfolio)

portfolioRouter.get("/foundPortfolio/:authId", AuthPortfolioFound)

portfolioRouter.get("/singleFolio/:folioId/:authId", singlePortfolio)

portfolioRouter.put("/updatePortfolio/:portfolioId",upload.fields([ { name: "portfolioImage", maxCount: 1 } ]),  updatePortFolio)

portfolioRouter.delete("/deletePortfolio/:portfolioId", deletePortfolio)

export default portfolioRouter