import express from "express";
import { addNewLabel, addNewLabel2, addNewLabel3, addNewLabel4, addNewLabel5, getAllLabels, getAllLabels2, getAllLabels3, getAllLabels4, getAllLabels5, insertPredefinedLabels, insertPredefinedLabels2, insertPredefinedLabels3, insertPredefinedLabels4, insertPredefinedLabels5, updateLabel } from "../Controllers/label_controller.js";

const router = express.Router();

router.post("/addLabel",addNewLabel );
router.post("/addLabel2",addNewLabel2 );
router.post("/addLabel3",addNewLabel3);
router.post("/addLabel4",addNewLabel4 );
router.post("/addLabel5",addNewLabel5 );

router.get("/getALLlabel", getAllLabels);
router.get("/getALLlabel2", getAllLabels2);
router.get("/getALLlabel3", getAllLabels3);
router.get("/getALLlabel4", getAllLabels4);
router.get("/getALLlabel5", getAllLabels5);

router.put("/updateLabel/:id", updateLabel);
router.post("/insert",insertPredefinedLabels );
router.post("/insert2",insertPredefinedLabels2 );
router.post("/insert3",insertPredefinedLabels3 );
router.post("/insert4",insertPredefinedLabels4 );
router.post("/insert5",insertPredefinedLabels5 );






export default router;