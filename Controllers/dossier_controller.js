import Folder from "../Models/dossier.js";

export async function createFolder(req, res) {
  try {
    const { name, userId } = req.body;

    const existingFolder = await Folder.findOne({ name, user: userId });

    if (existingFolder) {
      return res
        .status(409)
        .json({ message: "Le nom du dossier existe déjà." });
    }

    const folder = new Folder({ name, user: userId });
    await folder.save();

    res.status(201).json({ message: "Dossier créé avec succès", folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création du dossier",
      error,
    });
  }
}

export async function getFolders(req, res) {
  try {
    const userId = req.params.userId;
    const folders = await Folder.find({ user: userId });
    res
      .status(200)
      .json({ message: "Liste des dossiers récupérée avec succès", folders });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des dossiers",
      error,
    });
  }
}

export async function getFolderById(req, res) {
  try {
    const folderId = req.params.folderId;
    const folder = await Folder.findById(folderId);
    res.status(200).json({ message: "Dossier récupéré avec succès", folder });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération du dossier",
      error,
    });
  }
}

export async function updateFolder(req, res) {
  try {
    const folderId = req.params.folderId;
    const { name } = req.body;
    const updatedFolder = await Folder.findByIdAndUpdate(
      folderId,
      { name },
      { new: true }
    );
    res.status(200).json({
      message: "Dossier mis à jour avec succès",
      folder: updatedFolder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour du dossier",
      error,
    });
  }
}

export async function deleteFolder(req, res) {
  try {
    const folderId = req.params.folderId;
    await Folder.findByIdAndDelete(folderId);
    res.status(200).json({ message: "Dossier supprimé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du dossier",
      error,
    });
  }
}
