import Label1 from "../Models/label1.js";
import Label2 from "../Models/label2.js";
import Label3 from "../Models/label3.js";
import Label4 from "../Models/label4.js";
import Label5 from "../Models/label5.js";

import {
  racineLibelle1Mapping,
  racineLibelle2Mapping,
  racineLibelle3Mapping,
  racineLibelle4Mapping,
  racineLibelle5Mapping,
} from "../Models/mapping.js";

// Méthode pour récupérer tous les libellés de la collection label1
export async function getAllLabels(req, res) {
  try {
    const labels = await Label1.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabels2(req, res) {
  try {
    const labels = await Label2.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabels3(req, res) {
  try {
    const labels = await Label3.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabels4(req, res) {
  try {
    const labels = await Label4.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabels5(req, res) {
  try {
    const labels = await Label5.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}

export async function addNewLabel(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await Label1.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res
        .status(409)
        .json({
          success: false,
          message: `La racine ${labelData.rootId} existe déjà.`,
        });
    }

    const newLabel = new Label1(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du label.",
      });
  }
}
export async function addNewLabel2(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await Label2.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res
        .status(409)
        .json({
          success: false,
          message: `La racine ${labelData.rootId} existe déjà.`,
        });
    }

    const newLabel = new Label2(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du label.",
      });
  }
}
export async function addNewLabel3(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await Label3.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res
        .status(409)
        .json({
          success: false,
          message: `La racine ${labelData.rootId} existe déjà.`,
        });
    }

    const newLabel = new Label3(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du label.",
      });
  }
}
export async function addNewLabel4(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await Label4.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res
        .status(409)
        .json({
          success: false,
          message: `La racine ${labelData.rootId} existe déjà.`,
        });
    }

    const newLabel = new Label4(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du label.",
      });
  }
}

export async function addNewLabel5(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await Label5.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res
        .status(409)
        .json({
          success: false,
          message: `La racine ${labelData.rootId} existe déjà.`,
        });
    }

    const newLabel = new Label5(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Une erreur est survenue lors de l'ajout du label.",
      });
  }
}
export async function updateLabel(req, res) {
  try {
    const { id } = req.params;
    const { label } = req.body;
    await Label1.findByIdAndUpdate(id, { label });
    res.json({ message: "Libellé mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du libellé :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du libellé" });
  }
}

export async function updateLabelsFromMapping(req, res) {
  try {
    const mappingEntries = Object.entries(racineLibelle1Mapping);
    const promises = mappingEntries.map(([rootId, label]) => {
      return Label1.findOneAndUpdate({ rootId }, { label }, { upsert: true });
    });
    await Promise.all(promises);
    res.json({
      message: "Libellés mis à jour avec succès à partir du mapping",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des libellés à partir du mapping :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la mise à jour des libellés à partir du mapping",
    });
  }
}
export async function insertPredefinedLabels() {
  try {
    const labels = Object.entries(racineLibelle1Mapping).map(
      ([rootId, label]) => ({
        rootId,
        label,
      })
    );
    await Label1.create(labels);
    console.log("Libellés pré-définis insérés avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des libellés pré-définis :",
      error
    );
  }
}
export async function insertPredefinedLabels2() {
  try {
    const labels = Object.entries(racineLibelle2Mapping).map(
      ([rootId, label]) => ({
        rootId,
        label,
      })
    );
    await Label2.create(labels);
    console.log("Libellés pré-définis insérés avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des libellés pré-définis :",
      error
    );
  }
}
export async function insertPredefinedLabels3() {
  try {
    const labels = Object.entries(racineLibelle3Mapping).map(
      ([rootId, label]) => ({
        rootId,
        label,
      })
    );
    await Label3.create(labels);
    console.log("Libellés pré-définis insérés avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des libellés pré-définis :",
      error
    );
  }
}
export async function insertPredefinedLabels4() {
  try {
    const labels = Object.entries(racineLibelle4Mapping).map(
      ([rootId, label]) => ({
        rootId,
        label,
      })
    );
    await Label4.create(labels);
    console.log("Libellés pré-définis insérés avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des libellés pré-définis :",
      error
    );
  }
}
export async function insertPredefinedLabels5() {
  try {
    const labels = Object.entries(racineLibelle5Mapping).map(
      ([rootId, label]) => ({
        rootId,
        label,
      })
    );
    await Label5.create(labels);
    console.log("Libellés pré-définis insérés avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion des libellés pré-définis :",
      error
    );
  }
}
