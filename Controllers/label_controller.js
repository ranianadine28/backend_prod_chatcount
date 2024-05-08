import label1 from "../Models/label1.js";
import label2 from "../Models/label2.js";
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
    const labels = await label1.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabelsbyRech(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    // Vérifiez si rootId ou label est fourni dans la requête
    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels = await label1.find(query);
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
    const labels = await label2.find({});
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabelsbyRech2(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    // Vérifiez si rootId ou label est fourni dans la requête
    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels = await label2.find(query);
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getAllLabelsbyRech3(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    // Vérifiez si rootId ou label est fourni dans la requête
    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels = await Label3.find(query);
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
export async function getAllLabelsbyRech4(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    // Vérifiez si rootId ou label est fourni dans la requête
    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels = await Label4.find(query);
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
export async function getAllLabelsbyRech5(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    // Vérifiez si rootId ou label est fourni dans la requête
    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels = await Label5.find(query);
    res.json(labels);
  } catch (error) {
    console.error("Erreur lors de la récupération des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des libellés" });
  }
}
export async function getlabelbyrecherche(req, res) {
  try {
    const { rootId, label } = req.params;
    let query = {};

    if (rootId) {
      query.rootId = rootId;
    }
    if (label) {
      query.label = label;
    }

    const labels1 = await label1.find(query);
    const labels2 = await label2.find(query);
    const labels3 = await Label3.find(query);
    const labels4 = await Label4.find(query);
    const labels5 = await Label5.find(query);

    const allLabels = [
      ...labels1,
      ...labels2,
      ...labels3,
      ...labels4,
      ...labels5,
    ];

    res.json(allLabels);
  } catch (error) {
    console.error("Erreur lors de la recherche des libellés :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des libellés" });
  }
}

export async function addNewLabel(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await label1.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res.status(409).json({
        success: false,
        message: `La racine ${labelData.rootId} existe déjà.`,
      });
    }

    const newLabel = new label1(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout du label.",
    });
  }
}
export async function addNewLabel2(req, res) {
  const labelData = req.body;

  try {
    const existingLabel = await label2.findOne({ rootId: labelData.rootId });

    if (existingLabel) {
      return res.status(409).json({
        success: false,
        message: `La racine ${labelData.rootId} existe déjà.`,
      });
    }

    const newLabel = new label2(labelData);
    await newLabel.save();
    return res
      .status(201)
      .json({ success: true, message: "Label ajouté avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'ajout du label :", error);
    return res.status(500).json({
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
      return res.status(409).json({
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
    return res.status(500).json({
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
      return res.status(409).json({
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
    return res.status(500).json({
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
      return res.status(409).json({
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
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout du label.",
    });
  }
}

export async function updateLabel(req, res) {
  const conversationId = req.params.id;
  const { label } = req.body;

  try {
    // Rechercher la conversation par ID
    const newconversation = await label1.findById(conversationId);

    if (!newconversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mettre à jour le nom de la conversation
    newconversation.label = label;
    await newconversation.save();

    // Répondre avec la conversation mise à jour
    res
      .status(200)
      .json({ message: "Conversation updated successfully", label });
  } catch (error) {
    res.status(500).json({ message: "Error updating conversation", error });
  }
}

export async function updateLabel2(req, res) {
  const conversationId = req.params.id;
  const { label } = req.body;

  try {
    // Rechercher la conversation par ID
    const newconversation = await label2.findById(conversationId);

    if (!newconversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mettre à jour le nom de la conversation
    newconversation.label = label;
    await newconversation.save();

    // Répondre avec la conversation mise à jour
    res
      .status(200)
      .json({ message: "Conversation updated successfully", label });
  } catch (error) {
    res.status(500).json({ message: "Error updating conversation", error });
  }
}

export async function updateLabel3(req, res) {
  const conversationId = req.params.id;
  const { label } = req.body;

  try {
    // Rechercher la conversation par ID
    const newconversation = await Label3.findById(conversationId);

    if (!newconversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mettre à jour le nom de la conversation
    newconversation.label = label;
    await newconversation.save();

    // Répondre avec la conversation mise à jour
    res
      .status(200)
      .json({ message: "Conversation updated successfully", label });
  } catch (error) {
    res.status(500).json({ message: "Error updating conversation", error });
  }
}

export async function updateLabel4(req, res) {
  const conversationId = req.params.id;
  const { label } = req.body;

  try {
    // Rechercher la conversation par ID
    const newconversation = await Label4.findById(conversationId);

    if (!newconversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mettre à jour le nom de la conversation
    newconversation.label = label;
    await newconversation.save();

    // Répondre avec la conversation mise à jour
    res
      .status(200)
      .json({ message: "Conversation updated successfully", label });
  } catch (error) {
    res.status(500).json({ message: "Error updating conversation", error });
  }
}
export async function updateLabel5(req, res) {
  const conversationId = req.params.id;
  const { label } = req.body;

  try {
    // Rechercher la conversation par ID
    const newconversation = await Label5.findById(conversationId);

    if (!newconversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mettre à jour le nom de la conversation
    newconversation.label = label;
    await newconversation.save();

    // Répondre avec la conversation mise à jour
    res
      .status(200)
      .json({ message: "Conversation updated successfully", label });
  } catch (error) {
    res.status(500).json({ message: "Error updating conversation", error });
  }
}
export async function updateLabelsFromMapping(req, res) {
  try {
    const mappingEntries = Object.entries(racineLibelle1Mapping);
    const promises = mappingEntries.map(([rootId, label]) => {
      return Label1.findOneAndUpdate({ rootId }, { label });
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
    await label1.create(labels);
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
    await label2.create(labels);
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
export async function deleteLabel(req, res) {
  try {
    const labelId = req.params.labelId;
    await label1.findByIdAndDelete(labelId);
    res.status(200).json({ message: "label supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du label",
      error,
    });
  }
}
export async function deleteLabel2(req, res) {
  try {
    const labelId = req.params.labelId;
    await label2.findByIdAndDelete(labelId);
    res.status(200).json({ message: "label supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du label",
      error,
    });
  }
}
export async function deleteLabel3(req, res) {
  try {
    const labelId = req.params.labelId;
    await Label3.findByIdAndDelete(labelId);
    res.status(200).json({ message: "label supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du label",
      error,
    });
  }
}
export async function deleteLabel4(req, res) {
  try {
    const labelId = req.params.labelId;
    await Label4.findByIdAndDelete(labelId);
    res.status(200).json({ message: "label supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du label",
      error,
    });
  }
}
export async function deleteLabel5(req, res) {
  try {
    const labelId = req.params.labelId;
    await Label5.findByIdAndDelete(labelId);
    res.status(200).json({ message: "label supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du label",
      error,
    });
  }
}
