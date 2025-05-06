import Auth from "../../models/Auth-M/authModel.js";
import BidTask from "../../models/Bid-Task-M/bidTaskSchema.js";
import TaskSubcategory from "../../models/Task-M/Task-subcategory/task-subcategory-schema.js";
// import admin from "firebase-admin"
// import { token } from "morgan";
// import admin from "firebase-admin";


// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // Resolve __dirname in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load service account manually
// const serviceAccount = JSON.parse(
//   fs.readFileSync(path.join(__dirname, "../../../firebase-service-account.json"))
// );

// if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount)
//     });
//   }


export const createBid = async (req, res) => {

    try {

        const { loginAuthId, taskId } = req.params;

        const { description, minimalRate, deliveryTime, deliveryDays, status, confirmation_bid_user } = req.body;

        const checkTask = await TaskSubcategory.findOne({ _id: taskId });

        if (!checkTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const existingBid = await BidTask.findOne({ loginAuthId, taskId });

        if (existingBid) {
            const updatedBid = await BidTask.findOneAndUpdate(
                { loginAuthId, taskId },
                { description, minimalRate, deliveryTime, deliveryDays, status, confirmation_bid_user },
                { new: true }
            );

            return res.status(200).json({
                message: "Bid updated successfully",
                bidplace: updatedBid
            });
        }

        const newTaskCreate = new BidTask({
            loginAuthId, taskId, description, minimalRate, deliveryTime, deliveryDays, status, confirmation_bid_user, TaskCreaterId: checkTask.authId //owner of task
        });

        await newTaskCreate.save();

        res.status(200).json({
            message: "Placed bid on task",
            bidplace: newTaskCreate
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            msg:error.message
        });
    }
};



// get all task my bid according

export const found_all_bid_task = async (req, res) => {

    try {
        const { loginAuthId, taskId } = req.params

        const checkLoginAuth = await BidTask.find({ loginAuthId })

        if (!checkLoginAuth) {
            return res.status(404).json({
                message: "not found this auth profile"
            })
        }

        const allBidTask = await BidTask.find({ taskId })
            .sort({ createdAt: -1 })
            .populate({
                path: "taskId",
                select: "taskTitle"
            }).populate({
                path: "loginAuthId",
                select: "firstName lastName authProfile country"
            }).populate({
                path: "TaskCreaterId",
                select: "firstName"
            })

        if (allBidTask.length > 0) {
            res.status(200).json({
                message: "all found bid task",
                allBidTask: allBidTask
            })
        }

        else {
            res.status(404).json({
                message: "not found any bid task"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}



export const getReciverBid = async (req, res) => {

    try {
        const { loginAuthId, taskId } = req.params;

        const receivedBid = await BidTask.find({
            TaskCreaterId: loginAuthId,
            taskId: taskId
        })
            .sort({ createdAt: -1 })
            .populate({
                path: "taskId",
                select: "taskTitle"
            }).populate({
                path: "loginAuthId",
                select: "firstName"
            }).populate({
                path: "TaskCreaterId",
                select: "firstName"
            })

        res.status(200).json({
            message: "received bid on your task",
            receivedBids: receivedBid
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error
        });
    }
}




export const updateBidDetails = async (req, res) => {

    try {
        const { bidId } = req.params

        const { status,confirmation_bid_user } = req.body;

        const updateBidStatus = await BidTask.findOneAndUpdate({ _id: bidId }, {
            status, confirmation_bid_user
        }, { new: true })


        res.status(200).send({
            message: "update bid status",
            bidStatus: updateBidStatus
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}



export const found_all_bid_task_list = async (req, res) => {

    try {
        const { loginAuthId } = req.params

        const checkLoginAuth = await BidTask.find({ loginAuthId })

        if (!checkLoginAuth) {
            return res.status(404).json({
                message: "not found this auth profile"
            })
        }

        const allBidTask = await BidTask.find({ loginAuthId })
            .sort({ createdAt: -1 })
            .populate({
                path: "taskId",
                select: "taskTitle"
            }).populate({
                path: "loginAuthId",
                select: "firstName lastName authProfile country"
            }).populate({
                path: "TaskCreaterId",
                select: "firstName"
            })

        if (allBidTask.length > 0) {
            res.status(200).json({
                message: "all found bid task",
                allBidTask: allBidTask
            })
        }

        else {
            res.status(404).json({
                message: "not found any bid task"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
}




