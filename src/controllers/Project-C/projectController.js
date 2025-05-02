import Auth from "../../models/Auth-M/authModel.js";
import Deposit from "../../models/Deposit-M/depositSchema.js";
import Wallet from "../../models/Deposit-M/walletSchema.js";
import Draft from "../../models/Draft-M/draftSchema.js";
import Project from "../../models/Project-M/projectSchema.js";
import Service from "../../models/Service-M/serviceSchema.js";
import TaskSubcategory from "../../models/Task-M/Task-subcategory/task-subcategory-schema.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// get the single service quote use serviceId
export const found_service_quote = async (req, res) => {

    try {
        const { projectId } = req.params

        const checkService = await Project.findOne({ _id: projectId })
            .populate({
                path: "serviceId",
                select: "serviceImage title Basic_price.b_price authId"
            })
            .populate({
                path: "authId",
                select: "authProfile firstName lastName createdAt"
            })
            .populate({
                path: "messages.messagerId",
                select: "firstName lastName authProfile"
            })
            .populate({
                path: "uploadfiles.uploaderId",
                select: "firstName lastName authProfile"
            })

        if (checkService) {
            checkService.messages = checkService.messages.filter(msg => msg.message);
            res.status(200).json({
                message: "this is your service quote",
                service_quote: checkService
            })
        }

        else {
            res.status(404).json({
                message: "not found this service quote"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "internal server error"
        })
    }
}


// update messages and files on project quote
// export const updateServiceQuote = async (req, res) => {

//     try {
//         const { projectId, authId } = req.params;
//         const { message } = req.body;

//         //isse old image null nhi hogi jab select nhi karoge jab
//         // const quoteFileNames = req.files && req.files.length > 0
//         //     ? req.files.map(({ filename }) => filename)
//         //     : [];


//           let quoteFileNames = {}; 
        
//                 if (req.files && req.files.quoteFileNames && Array.isArray(req.files.quoteFileNames) && req.files.quoteFileNames.length > 0) {
//                     const uploadResults = [];
//                     for (const file of req.files.quoteFileNames) {
//                         const quoteFileNamesUpload = await cloudinary.uploader.upload(
//                             file.path,
//                             {
//                                 folder: "cover_blogs",
//                                 overwrite: false,
//                             }
//                         );
//                         uploadResults.push(quoteFileNamesUpload.secure_url);
//                         if (!quoteFileNames.public_id && uploadResults.length > 0) {
//                             quoteFileNames.public_id = `service_${Date.now()}`; 
//                         }
//                     }
//                     quoteFileNames.url = uploadResults;
//                 } else if (req.body.oldquoteFileNames) {
//                     quoteFileNames.url = Array.isArray(req.body.oldquoteFileNames)
//                         ? req.body.oldquoteFileNames
//                         : [req.body.oldquoteFileNames];
//                     quoteFileNames.public_id = req.body.oldServiceImagePublicId || null;
//                 } else {
//                     const existingService = await Service.findById(projectId);
//                     if (existingService && existingService.quoteFileNames) {
//                         quoteFileNames = { ...existingService.quoteFileNames }; 
//                     }
//                 }


//         const checkProject = await Project.findOne({ _id: projectId });
//         if (!checkProject) {
//             return res.status(404).json({
//                 message: "Project not found"
//             });
//         }

//         const updateData = {
//             $push: { messages: { message, messagerId: authId } }
//         };

//         if (quoteFileNames.length > 0) {
//             updateData.$push.uploadfiles = { quotefileName: quoteFileNames, uploaderId: authId };
//         }

//         const addOn = await Project.findOneAndUpdate(
//             { _id: projectId },
//             updateData,
//             { new: true }
//         );

//         if (addOn) {
//             res.status(200).json({
//                 message: "Updated quotes successfully"
//             });

//         } else {
//             res.status(404).json({
//                 message: "Project quote update failed"
//             });
//         }
//     } catch (error) {
//         res.status(500).json({
//             message: "Internal server error"
//         });
//     }

// }

export const updateServiceQuote = async (req, res) => {
    try {
        const { projectId, authId } = req.params;
        const { message } = req.body;

        let quoteFileNames = { url: [], public_id: null };

        if (req.files && req.files.quoteFileNames && Array.isArray(req.files.quoteFileNames) && req.files.quoteFileNames.length > 0) {
            const uploadResults = [];
            for (const file of req.files.quoteFileNames) {
                const quoteFileNamesUpload = await cloudinary.uploader.upload(
                    file.path,
                    { folder: "cover_blogs", overwrite: false }
                );
                uploadResults.push(quoteFileNamesUpload.secure_url);
                if (!quoteFileNames.public_id && uploadResults.length > 0) {
                    quoteFileNames.public_id = `project_${Date.now()}`; // More specific public_id
                }
            }
            quoteFileNames.url = uploadResults;
        } else if (req.body.oldquoteFileNamesUrls) {
            quoteFileNames.url = Array.isArray(req.body.oldquoteFileNamesUrls)
                ? req.body.oldquoteFileNamesUrls
                : [req.body.oldquoteFileNamesUrls];
            quoteFileNames.public_id = req.body.oldquoteFileNamesPublicId || null;
        } else {
            const existingProject = await Project.findById(projectId);
            if (existingProject && existingProject.uploadfiles && existingProject.uploadfiles.length > 0 && existingProject.uploadfiles[0].quotefileName) {
                quoteFileNames = { url: existingProject.uploadfiles[0].quotefileName.url || [], public_id: existingProject.uploadfiles[0].quotefileName.public_id || null };
            }
        }

        const checkProject = await Project.findOne({ _id: projectId });
        if (!checkProject) {
            return res.status(404).json({ message: "Project not found" });
        }

        const updateData = {
            $push: { messages: { message, messagerId: authId } }
        };

        if (quoteFileNames.url && quoteFileNames.url.length > 0) {
            updateData.$push.uploadfiles = { quotefileName: quoteFileNames, uploaderId: authId };
        }

        const addOn = await Project.findOneAndUpdate(
            { _id: projectId },
            updateData,
            { new: true }
        );

        if (addOn) {
            res.status(200).json({ message: "Updated quotes successfully", addOn });
        } else {
            res.status(404).json({ message: "Project quote update failed" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};



// delete quote message on message id and auth id
export const deleteQuoteMessages = async (req, res) => {

    try {
        const { authId, messageId } = req.params

        const checkUser = await Project.findOne({ authId })

        if (!checkUser) {
            return res.status(404).json({
                message: "not found auth profile"
            })
        }

        const updateProject = await Project.findOneAndUpdate( 
            { authId },
            { $pull: { messages: { _id: messageId } } },
            { new: true }
        )

        if (updateProject) {
            res.status(200).json({
                message: "deleted this message"
            })
        }

        else {
            res.status(404).json({
                message: "not found this message"
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

// delete quote file on file id and auth id
export const deleteUplodedFiles = async (req, res) => {

    try {
        const { authId, uploadFileId } = req.params

        const checkUser = await Project.findOne({ authId })

        if (!checkUser) {
            return res.status(404).json({
                message: "not found authProfile"
            })
        }

        const updateProject = await Project.findOneAndUpdate(

            { authId },
            { $pull: { uploadfiles: { _id: uploadFileId } } },
            { new: true }
        )

        if (updateProject) {
            res.status(200).json({
                message: "deleted this file"
            })
        }

        else {
            res.status(404).json({
                message: "not found this file"
            })
        }

    } catch (error) {
        res.status(500).json({
            message:error
        })
    }
}


export const fetchDeshboardDetails = async (req, res) => {

    try {

        const { authId } = req.params

        const checkAuth = await Auth.findOne({ _id: authId })

        if (!checkAuth) {
            return res.status(404).json({
                message: "not found auth profile"
            })
        }

        const project_details = (await Project.find({ authId })).length

        const check_draft_service = (await Draft.find({ authId })).length

        const check_public_service = (await Service.find({ authId })).length

        const totalCreatedTask = (await TaskSubcategory.find({ authId })).length

        const totalServices = check_draft_service + check_public_service;

        const deposits = await Wallet.find({loginAuthId : authId });

        // Calculate total deposit amount
        const totalDepositAmount = deposits.reduce((total, deposit) => total + deposit.amountUSD, 0); 



            res.status(200).json({
                message: "deshboard details",
                totalProjects: project_details,
                totalServices: totalServices,
                totalDepositAmount: totalDepositAmount,
                totalCreatedTask : totalCreatedTask
            })

       

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}



export const createProject = async (req, res) => {

    try {
        const { authId, serviceId } = req.params;

        const { order_quotes, dead_line, status } = req.body;

        // Check if the service exists
        const checkService = await Service.findById(serviceId);

        if (!checkService) {
            return res.status(401).json({ message: "Service not found" });
        }

        // Check if the same order quote already exists
        const checkQuote = await Project.findOne({ order_quotes, serviceId });

        if (checkQuote) {
            return res.status(400).json({ message: "This order quote already exists" });
        }

        // Create a new project
        const newProject = new Project({
            order_quotes,
            serviceId,
            authId,
            dead_line,
            status,
            serviceAuthId: checkService.authId, // Owner of the service
        });

        await newProject.save();

        res.status(200).json({
            message: "New project created successfully",
            newProject,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




export const found_allProjects = async (req, res) => {

    try {
        const { authId } = req.params

        const checkAuth = await Project.find({ authId })

        if (!checkAuth) {
            return res.status(404).json({
                message: "not found this auth profile"
            })
        }

        const allProjects = await Project.find({ authId }).select("-messages -uploadfiles -authId")
            .sort({ createdAt: -1 })
            .populate({
                path: "serviceId",
                select: "title",
                //alg table se populate krne ke ley like service se meko authId chy tha
                populate: {
                    path: "authId",
                    select: "firstName"
                }
            })

        if (allProjects.length > 0) {
            res.status(200).json({
                message: "all found projects",
                allProjects: allProjects
            })
        }

        else {
            res.status(404).json({
                message: "not found any projects"
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

// Get quotes received by a service owner
export const getReceivedQuotes = async (req, res) => {
    try {
        const { authId } = req.params;

        const receivedQuotes = await Project.find({ serviceAuthId: authId })
            .sort({ createdAt: -1 })
            .populate({
                path: "serviceId",
                select: "title",
                //alg table se populate krne ke ley like service se meko authId chy tha
                populate: {
                    path: "authId",
                    select: "firstName"
                }
            })

        res.status(200).json(receivedQuotes);


    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
};


export const updateProject = async (req, res) => {

    try {
        const { projectId } = req.params

        const { dead_line, status } = req.body;

        const updateProject = await Project.findOneAndUpdate({ _id: projectId }, {
            dead_line, status

        }, { new: true })


        res.status(200).send(updateProject)


    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}