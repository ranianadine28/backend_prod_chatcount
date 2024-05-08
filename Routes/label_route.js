import express from "express";
import { addNewLabel, addNewLabel2, addNewLabel3, addNewLabel4, addNewLabel5, deleteLabel, deleteLabel2, deleteLabel3, deleteLabel4, deleteLabel5, getAllLabels, getAllLabels2, getAllLabels3, getAllLabels4, getAllLabels5, getAllLabelsbyRech, getAllLabelsbyRech2, getAllLabelsbyRech3, getAllLabelsbyRech4, getAllLabelsbyRech5, getlabelbyrecherche, insertPredefinedLabels, insertPredefinedLabels2, insertPredefinedLabels3, insertPredefinedLabels4, insertPredefinedLabels5, updateLabel, updateLabel2, updateLabel3, updateLabel4, updateLabel5 } from "../Controllers/label_controller.js";

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
router.get("/getAllLabels/:rootId/:label", getAllLabelsbyRech);
router.get("/getAllLabels2/:rootId/:label", getAllLabelsbyRech2);
router.get("/getAllLabels3/:rootId/:label", getAllLabelsbyRech3);

router.get("/getAllLabels4/:rootId/:label", getAllLabelsbyRech4);

router.get("/searchAllLabels/:rootId/:label", getlabelbyrecherche);


router.patch("/updateLabel/:id", updateLabel);
router.patch("/updateLabel2/:id", updateLabel2);
router.patch("/updateLabel3/:id", updateLabel3);
router.patch("/updateLabel4/:id", updateLabel4);
router.patch("/updateLabel5/:id", updateLabel5);


router.post("/insert",insertPredefinedLabels );
router.post("/insert2",insertPredefinedLabels2 );
router.post("/insert3",insertPredefinedLabels3 );
router.post("/insert4",insertPredefinedLabels4 );
router.post("/insert5",insertPredefinedLabels5 );

router.delete("/deleteLabel/:labelId", deleteLabel);
router.delete("/deleteLabel2/:labelId", deleteLabel2);

router.delete("/deleteLabel3/:labelId", deleteLabel3);

router.delete("/deleteLabel4/:labelId", deleteLabel4);

router.delete("/deleteLabel5/:labelId", deleteLabel5);






export default router;