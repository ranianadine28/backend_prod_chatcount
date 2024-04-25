import Folder from "../Models/dossier.js";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { parseStream } from "fast-csv";
import pkg from "csv-parser";
const { parse } = pkg;
import fs from "fs";
import FecModel from "../Models/fec.js";
import path from "path";
import {
  racineLibelle1Mapping,
  racineLibelle2Mapping,
  racineLibelle3Mapping,
  racineLibelle4Mapping,
  racineLibelle5Mapping,
} from "../Models/mapping.js";
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
    res.status(200).json({ folders });
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
export async function recupFolderName(req, res) {
  try {
    const folderId = req.params.folderId;

    const folder = await Folder.findById(folderId);
    if (!folder) {
      console.error("Dossier non trouvé.");
      return res.status(404).json({ message: "Dossier non trouvé." });
    }

    console.log("Nom du dossier:", folder.name);
    return res.status(200).send({ folderName: folder.name });
  } catch (error) {
    console.error("Erreur lors de la récupération du nom du dossier :", error);
    return res.status(500).json({
      message: "Erreur lors de la récupération du nom du dossier",
      error,
    });
  }
}

export async function uploadFec(req, res) {
  try {
    const uploadedFile = req.file;
    const userId = req.params.userId;
    const folderId = req.params.folderId; // Supposons que l'ID du dossier soit envoyé dans le corps de la requête

    if (!uploadedFile) {
      return res
        .status(403)
        .json({ message: "Aucun fichier n'a été uploadé." });
    }

    const existingFec = await FecModel.findOne({
      name: uploadedFile.originalname,
      user: userId,
      folder: folderId, // Vérifier si un FEC avec le même nom existe déjà dans ce dossier
    });

    if (existingFec) {
      return res.status(409).json({
        message: "Un fichier avec le même nom existe déjà dans ce dossier.",
        fecId: existingFec._id,
      });
    }

    const processedData = await processCsvFile(req, res);

    const fecData = {
      name: uploadedFile.originalname,
      data: processedData,
      user: userId,
      folder: folderId, // Associer le FEC au dossier spécifié
    };

    const fec = new FecModel(fecData);
    await fec.save();

    return res.status(300).json({
      message: "Fichier uploadé et traité avec succès!",
      fecId: fec._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du traitement du fichier.",
      error,
    });
  }
}

async function processCsvFile(req, res) {
  const file = req.file;
  const csvData = [];

  try {
    const csvStream = fs.createReadStream(file.path);
    const csvParser = parseStream(csvStream, { headers: true });

    for await (const record of csvParser) {
      csvData.push(record);
    }

    // Process the CSV data (csvData)
  } catch (error) {
    console.error(error);
    return [];
    // Handle errors appropriately
  }
}

// Fonction pour traiter chaque ligne du fichier CSV
function processRow(row) {
  // Implémenter votre logique pour manipuler les données de chaque ligne
  // Vous pouvez accéder aux valeurs individuelles en utilisant row['
  return row;
}
export async function getFec(req, res) {
  try {
    const userId = req.params.userId;
    const folderId = req.params.folderId; // Supposons que l'ID du dossier soit envoyé en tant que paramètre de requête

    const query = { user: userId };
    if (folderId) {
      query.folder = folderId; // Filtrer les FEC par dossier si l'ID du dossier est fourni
    }

    const fecs = await FecModel.find(query);

    res.status(200).json({ fecs });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des FEC",
      error,
    });
  }
}

export async function replaceFile(req, res) {
  try {
    const existingFecId = req.params.existingFecId;
    const uploadedFile = req.file;
    const folderId = req.body.folderId; // Supposons que l'ID du dossier soit envoyé dans le corps de la requête

    const existingFec = await FecModel.findById(existingFecId);
    if (!existingFec) {
      return res
        .status(404)
        .json({ message: "Le FEC à remplacer n'existe pas." });
    }

    existingFec.name = uploadedFile.originalname;
    existingFec.data = await processCsvFile(req, res); // Assurez-vous d'avoir la fonction processCsvFile définie
    existingFec.folder = folderId; // Mettre à jour le dossier parent

    await existingFec.save();

    return res
      .status(200)
      .json({ message: "Fichier FEC remplacé avec succès!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du remplacement du fichier FEC.",
      error,
    });
  }
}
export async function deleteFec(req, res) {
  try {
    const fecIdToDelete = req.params.fecId;

    const existingFec = await FecModel.findById(fecIdToDelete);
    if (!existingFec) {
      return res
        .status(404)
        .json({ message: "Le FEC à supprimer n'existe pas." });
    }

    // Supprimer la référence du FEC dans le dossier
    await Folder.findByIdAndUpdate(existingFec.folder, {
      $pull: { documents: fecIdToDelete },
    });

    // Supprimer le FEC de la base de données
    await FecModel.findByIdAndDelete(fecIdToDelete);

    return res
      .status(200)
      .json({ message: "Fichier FEC supprimé avec succès du dossier!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:
        "Une erreur est survenue lors de la suppression du fichier FEC du dossier.",
      error,
    });
  }
}
function replaceSpecial(string) {
  if (typeof string === "string") {
    return string.replace(/[éèê]/g, "e").replace(/[àâ]/g, "a");
  }
  return string;
}

function generateCsv(labels, rows) {
  let csv = labels.join(";") + "\n";
  for (const row of rows) {
    csv += row.join(";") + "\n";
  }
  return csv;
}

export async function lancerTraitement(req, res) {
  try {
    const fecId = req.params.fecId;
    const fec = await FecModel.findById(fecId);

    if (!fec) {
      console.error("FEC introuvable");
      return res.status(404).json({ message: "FEC introuvable" });
    }

    const fecData = fec.data;

    const csvFilePath = path.join("uploads", fec.name);

    fs.readFile(csvFilePath, "utf-8", (err, data) => {
      if (err) {
        console.error("Erreur lors du chargement du fichier FEC :", err);
        return res.status(500).json({
          message: "Erreur lors du chargement du fichier FEC",
          error: err,
        });
      }

      const lines = data.split("\n");
      let labelsFEC = [];
      let rowsFEC = [];

      for (let i = 0; i < lines.length; i++) {
        const row = lines[i].trim().split(";");
        if (row.length === 1 && row[0] === "") continue;

        if (i === 0) {
          labelsFEC = row.map((label) => replaceSpecial(label));

          labelsFEC.push(
            "1-Montant",
            "2-Valeur Absolue",
            "3-Mois",
            "4-Trimestre",
            "5-Semestre",
            "6-Annee",
            "7-Racine 1",
            "8-Libelle Racine 1",
            "9-Racine 2",
            "10-Libellé Racine 2",
            "11-Racine 3",
            "12-Libelle Racine 3",
            "13-Racine 4",
            "14-Libelle Racine 4",
            "15-Racine 5",
            "16-Libelle Racine 5",
            "17-Bilan",
            "18-Resultat",
            "19-Report à nouveau",
            "20-Tresorerie",
            "23-Debit/Credit",
            "24-Encaissements / Decaissements",
            "25-Achats",
            "26-Ventes",
            "27-Journal d'operations diverses",
            "29-Investissements",
            "30-Amortissements",
            "31-Provisions"
          );
        } else {
          rowsFEC.push(row.map((value) => replaceSpecial(value)));
        }
      }

      for (let i = 1; i < rowsFEC.length; i++) {
        const credit =
          parseFloat(rowsFEC[i][labelsFEC.indexOf("L-Credit")]) || 0;
        const debit = parseFloat(rowsFEC[i][labelsFEC.indexOf("K-Debit")]) || 0;
        const montant = credit - debit;
        rowsFEC[i][labelsFEC.indexOf("1-Montant")] = montant.toString();
        const valeurAbsolueMontant = Math.abs(montant);
        rowsFEC[i][labelsFEC.indexOf("2-Valeur Absolue")] =
          valeurAbsolueMontant.toString();
            const ecritureDate = new Date(rowsFEC[i][labelsFEC.indexOf("D-EcritureDate")]);
          
            const moisNames = [
              "janvier", "février", "mars", "avril", "mai", "juin",
              "juillet", "août", "septembre", "octobre", "novembre", "décembre"
            ];
          
            // Mois (2.3)
            if (ecritureDate instanceof Date && !isNaN(ecritureDate)) {
              const mois = moisNames[ecritureDate.getMonth()];
              rowsFEC[i][labelsFEC.indexOf("3-Mois")] = replaceSpecial(mois);
          
              const trimestre = Math.floor((ecritureDate.getMonth() + 3) / 3);
              rowsFEC[i][labelsFEC.indexOf("4-Trimestre")] = trimestre;
          
              const semestre = Math.ceil((ecritureDate.getMonth() + 6) / 6);
              rowsFEC[i][labelsFEC.indexOf("5-Semestre")] = semestre;
          
              const annee = ecritureDate.getFullYear();
              rowsFEC[i][labelsFEC.indexOf("6-Annee")] = annee;
          } else {
              // Si la date n'est pas valide, attribuer des valeurs vides
              rowsFEC[i][labelsFEC.indexOf("3-Mois")] = "";
              rowsFEC[i][labelsFEC.indexOf("4-Trimestre")] = "";
              rowsFEC[i][labelsFEC.indexOf("5-Semestre")] = "";
              rowsFEC[i][labelsFEC.indexOf("6-Annee")] = "";
          }
          
          
        const compteComptable = rowsFEC[i][labelsFEC.indexOf("E-CompteNum")];
        const racine1 = compteComptable.substring(0, 1);
        const racine2 = compteComptable.substring(0, 2);
        const racine3 = compteComptable.substring(0, 3);
        const racine4 = compteComptable.substring(0, 4);
        const racine5 = compteComptable.substring(0, 5);

        rowsFEC[i][labelsFEC.indexOf("7-Racine 1")] = racine1;
        rowsFEC[i][labelsFEC.indexOf("9-Racine 2")] = racine2;
        rowsFEC[i][labelsFEC.indexOf("11-Racine 3")] = racine3;
        rowsFEC[i][labelsFEC.indexOf("13-Racine 4")] = racine4;
        rowsFEC[i][labelsFEC.indexOf("15-Racine 5")] = racine5;
        rowsFEC[i][labelsFEC.indexOf("8-Libelle Racine 1")] = replaceSpecial(
          racineLibelle1Mapping[racine1]
        );
        rowsFEC[i][labelsFEC.indexOf("10-Libelle Racine 2")] = replaceSpecial(
          racineLibelle2Mapping[racine2]
        );
        rowsFEC[i][labelsFEC.indexOf("12-Libelle Racine 3")] = replaceSpecial(
          racineLibelle3Mapping[racine3]
        );
        rowsFEC[i][labelsFEC.indexOf("14-Libelle Racine 4")] = replaceSpecial(
          racineLibelle4Mapping[racine4]
        );
        rowsFEC[i][labelsFEC.indexOf("16-Libelle Racine 5")] = replaceSpecial(
          racineLibelle5Mapping[racine5]
        );

        const racineNum = parseInt(racine1);
        if (racineNum >= 0 && racineNum <= 5) {
          rowsFEC[i][labelsFEC.indexOf("17-Bilan")] = "Bilan";
        } else if (racineNum >= 6 && racineNum <= 7) {
          rowsFEC[i][labelsFEC.indexOf("18-Resultat")] = "Resultat";
        }
        if (
          racine3 === "512" &&
          rowsFEC[i][labelsFEC.indexOf("A-JournalCode")] !== "RAN"
        ) {
          rowsFEC[i][labelsFEC.indexOf("20-Tresorerie")] = "Tresorerie";
        }

        const debitCreditD = credit === 0 ? "D" : "C";
        rowsFEC[i][labelsFEC.indexOf("23-Debit/Credit")] = replaceSpecial(debitCreditD);
      }
      const premierDateFEC = rowsFEC[1][labelsFEC.indexOf("D-EcritureDate")];

      const isFirstDateFEC = rowsFEC.every(
        (row) => row[labelsFEC.indexOf("D-EcritureDate")] === premierDateFEC
      );

      const hasRacine67 = rowsFEC.some((row) => {
        const racine1 = row[labelsFEC.indexOf("E-CompteNum")].substring(0, 1);
        return racine1 === "6" || racine1 === "7";
      });

      const isReportAN = rowsFEC.some((row) =>
        ["RAN", "SAN", "AN", "AND"].includes(
          row[labelsFEC.indexOf("A-JournalCode")]
        )
      );

      const montantTotalCol13 = rowsFEC.reduce(
        (total, row) =>
          total + parseFloat(row[labelsFEC.indexOf("13-Racine 4")]),
        0
      );

      const isMontantTotalZero = montantTotalCol13 === 0;

      rowsFEC.forEach((row) => {
        if (
          isFirstDateFEC &&
          !hasRacine67 &&
          isReportAN &&
          isMontantTotalZero
        ) {
          row[labelsFEC.indexOf("19-Report a nouveau")] = "Report";
        } else {
          row[labelsFEC.indexOf("19-Report a nouveau")] = "";
        }
      });

      let isAchat = false;
      const comptesNum = rowsFEC.map(
        (row) => row[labelsFEC.indexOf("E-CompteNum")]
      );
      const debitCredit = rowsFEC.map(
        (row) => row[labelsFEC.indexOf("23-Debit/Credit")]
      );

      for (let i = 1; i < rowsFEC.length; i++) {
        const compteNum = rowsFEC[i][labelsFEC.indexOf("E-CompteNum")];
        const journalCode = rowsFEC[i][labelsFEC.indexOf("A-JournalCode")];

        // Vérifier si le compte est un compte fournisseur (401) et n'est pas catégorisé comme trésorerie
        if (
          compteNum.startsWith("401") &&
          debitCredit[i] === "C" &&
          !journalCode.startsWith("TRES")
        ) {
          isAchat = true;
        }

        // Vérifier si le compte est 60, 61 ou 62 en racine 2 et au débit
        if (
          (compteNum.startsWith("60") ||
            compteNum.startsWith("61") ||
            compteNum.startsWith("62")) &&
          debitCredit[i] === "D"
        ) {
          isAchat = true;
        }

        // Vérifier si le journal a un code AC, ACH, FG, etc.
        if (
          journalCode === "AC" ||
          journalCode === "ACH" ||
          journalCode === "FG"
        ) {
          isAchat = true;
        }
      }

      if (isAchat) {
        for (let i = 1; i < rowsFEC.length; i++) {
          rowsFEC[i][labelsFEC.indexOf("25-Achats")] = "Achats";
        }
      }
      // Identifier les écritures de ventes
      let isVente = false;
      for (let i = 1; i < rowsFEC.length; i++) {
        const compteNum = rowsFEC[i][labelsFEC.indexOf("E-CompteNum")];
        const journalCode = rowsFEC[i][labelsFEC.indexOf("A-JournalCode")];
        const debit = parseFloat(rowsFEC[i][labelsFEC.indexOf("K-Debit")]);
        const credit = parseFloat(rowsFEC[i][labelsFEC.indexOf("L-Credit")]);

        // Vérifier si le compte est un compte client (411) ou une remise à l'encaissement (53) ou de la caisse, et n'est pas catégorisé comme trésorerie
        if (
          (compteNum.startsWith("411") ||
            compteNum.startsWith("53") ||
            compteNum.startsWith("Caisse")) &&
          debitCredit[i] === "D" &&
          !journalCode.startsWith("TRES")
        ) {
          isVente = true;
        }

        // Vérifier si le compte est 70 en racine 2 et au débit
        if (compteNum.startsWith("70") && debitCredit[i] === "D") {
          isVente = true;
        }

        // Vérifier si le journal a un code VE, CA, etc.
        if (journalCode === "VE" || journalCode === "CA") {
          isVente = true;
        }
      }

      // Ajouter les valeurs pour la colonne Vente
      if (isVente) {
        for (let i = 1; i < rowsFEC.length; i++) {
          rowsFEC[i][labelsFEC.indexOf("26-Ventes")] = "Ventes";
        }
      }
      for (let i = 1; i < rowsFEC.length; i++) {
        const racine1 = rowsFEC[i][labelsFEC.indexOf("7-Racine 1")];
        const racineIndex = labelsFEC.indexOf("8-Libelle Racine 1");
        const racine2 =
          racineIndex !== -1 ? rowsFEC[i][racineIndex].slice(0, 2) : "";
        const racine3 = rowsFEC[i][labelsFEC.indexOf("9-Racine 2")].slice(0, 3);

        // Vérifier si l'écriture est une opération diverse
        if (
          racine1 !== "5" && // Exclure les écritures liées aux ventes
          racine1 !== "6" && // Exclure les écritures liées aux achats
          racine2 !== "53" && // Exclure les écritures liées aux remises à l'encaissement
          racine2 !== "41" && // Exclure les écritures liées aux comptes clients
          racine2 !== "51" && // Exclure les écritures liées aux comptes fournisseurs
          racine3 !== "512" // Exclure les écritures liées aux comptes bancaires
        ) {
          rowsFEC[i][labelsFEC.indexOf("27-Journal d'operations diverses")] =
            "Journal"; // Marquer l'écriture comme étant dans le journal d'opérations diverses
        } else {
          rowsFEC[i][labelsFEC.indexOf("27-Journal d'operations diverses")] =
            "";
        }
      }

      for (let i = 1; i < rowsFEC.length; i++) {
        const racine2 = rowsFEC[i][labelsFEC.indexOf("9-Racine 2")].slice(0, 2);

        if (racine2 >= "20" && racine2 <= "27") {
          rowsFEC[i][labelsFEC.indexOf("29-Investissements")] =
            "Investissements";
        } else {
          rowsFEC[i][labelsFEC.indexOf("29-Investissements")] = "";
        }
      }
      for (let i = 1; i < rowsFEC.length; i++) {
        const racine2 = rowsFEC[i][labelsFEC.indexOf("9-Racine 2")].slice(0, 2);

        if (racine2 === "28") {
          rowsFEC[i][labelsFEC.indexOf("30-Amortissements")] = "Amortissements";
        } else {
          rowsFEC[i][labelsFEC.indexOf("30-Amortissements")] = "";
        }
      }
      for (let i = 1; i < rowsFEC.length; i++) {
        const racine3 = rowsFEC[i][labelsFEC.indexOf("9-Racine 2")].slice(0, 3);

        if (racine3[0] === "4" && racine3[2] === "8") {
          rowsFEC[i][labelsFEC.indexOf("31-Provisions")] = "Provisions";
        } else {
          rowsFEC[i][labelsFEC.indexOf("31-Provisions")] = "";
        }
      }
      for (let i = 1; i < rowsFEC.length; i++) {
        const montant = parseFloat(rowsFEC[i][labelsFEC.indexOf("1-Montant")]);

        if (montant < 0) {
          rowsFEC[i][labelsFEC.indexOf("24-Encaissements / Decaissements")] =
            "Encaissements";
        } else if (montant > 0) {
          rowsFEC[i][labelsFEC.indexOf("24-Encaissements / Decaissements")] =
            "Decaissements";
        } else {
          rowsFEC[i][labelsFEC.indexOf("24-Encaissements / Decaissements")] =
            "";
        }
      }

      fs.writeFile(
        csvFilePath,
        generateCsv(labelsFEC, rowsFEC),
        "utf-8",
        (err) => {
          if (err) {
            console.error("Erreur lors de l'écriture du fichier FEC :", err);
            return res.status(500).json({
              message: "Erreur lors de l'écriture du fichier FEC",
              error: err,
            });
          }
          fec.etat = "traité";
          fec.save();
          console.log("Fichier FEC mis à jour avec succès");
          return res
            .status(200)
            .json({ message: "Traitement du FEC terminé avec succès" });
        }
      );
    });
  } catch (error) {
    console.error("Une erreur est survenue lors du traitement du FEC :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors du traitement du FEC",
      error: error,
    });
  }
}
