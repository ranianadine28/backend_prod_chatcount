import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import ColumnData from "../Models/mot_clets.js";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";

import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function exportCSVData(req, res) {
  try {
    const csvData = await ColumnData.findOne();

    if (!csvData) {
      return res.status(404).json({ message: "Aucune donnée CSV trouvée" });
    }

    const filePath = "exports/exportedData.csv";

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: csvData.titre
        .split(";")
        .map((column) => ({ id: column, title: column })),
    });

    await csvWriter.writeRecords(
      csvData.contenu.map((row) => {
        const rowData = {};
        row.split(";").forEach((value, index) => {
          rowData[csvData.titre.split(";")[index]] = value;
        });
        return rowData;
      })
    );

    res.download(filePath, "exportedData.csv", (err) => {
      if (err) {
        console.error("Error sending CSV file:", err);
        res
          .status(500)
          .json({ message: "Erreur lors de l'envoi du fichier CSV" });
      } else {
        console.log("CSV file sent successfully");
        try {
          fs.unlinkSync(filePath);
          console.log("CSV file deleted successfully");
        } catch (unlinkError) {
          console.error("Error deleting CSV file:", unlinkError);
        }
      }
    });
  } catch (error) {
    console.error("Error exporting CSV data:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'exportation des données CSV" });
  }
}
export async function importCSVData(req, res) {
  try {
    // Vérifiez si req.body est défini et si fileName est fourni
    const fileName = req.body && req.body.fileName ? req.body.fileName : null;
    const columns = {};
    await ColumnData.deleteMany({});

    let filePath;
    if (fileName) {
      // Utiliser le fichier revenu par l'upload
      filePath = "uploads/" + fileName;
    } else {
      // Utiliser le fichier par défaut
      filePath = "uploads/MotsCles.csv";
    }

    fs.createReadStream(filePath)
      .pipe(csvParser({ delimiter: ";" }))
      .on("data", (row) => {
        Object.keys(row).forEach((key) => {
          if (!columns[key]) {
            columns[key] = {
              titre: key,
              contenu: [],
            };
          }
          columns[key].contenu.push(row[key]);
        });
      })
      .on("end", async () => {
        try {
          for (const [key, columnData] of Object.entries(columns)) {
            const column = new ColumnData(columnData);
            await column.save();
            console.log(`Column data inserted: ${key}`);
          }
          res.status(200).json({
            message: "Données CSV importées avec succès.",
          });
        } catch (err) {
          console.error(
            "Erreur lors de l'insertion des données de la colonne :",
            err
          );
          res.status(500).json({
            message: "Erreur lors de l'insertion des données de la colonne.",
          });
        } finally {
          mongoose.connection.close();
        }
      })
      .on("error", (err) => {
        console.error("Erreur lors de la lecture du fichier CSV :", err);
        res.status(500).json({
          message: "Erreur lors de la lecture du fichier CSV.",
        });
      });
  } catch (error) {
    console.error("Erreur lors de l'importation des données CSV :", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de l'importation des données CSV.",
    });
  }
}
export async function getcsvData(req, res) {
  try {
    const csvData = await ColumnData.findOne();

    if (!csvData) {
      return res.status(404).json({ message: "Aucune donnée CSV trouvée" });
    }

    res.json(csvData);
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données CSV" });
  }
}
export async function importStatiqueData(filePath) {
  try {
    const columns = {};
    await ColumnData.deleteMany({});

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser({ delimiter: ";" }))
        .on("data", (row) => {
          Object.keys(row).forEach((key) => {
            if (!columns[key]) {
              columns[key] = {
                titre: key,
                contenu: [],
              };
            }
            columns[key].contenu.push(row[key]);
          });
        })
        .on("end", async () => {
          try {
            for (const [key, columnData] of Object.entries(columns)) {
              const column = new ColumnData(columnData);
              await column.save();
              console.log(`Column data inserted: ${key}`);
            }
            resolve("Données CSV importées avec succès.");
          } catch (err) {
            console.error(
              "Erreur lors de l'insertion des données de la colonne :",
              err
            );
            reject("Erreur lors de l'insertion des données de la colonne.");
          }
        })
        .on("error", (err) => {
          console.error("Erreur lors de la lecture du fichier CSV :", err);
          reject("Erreur lors de la lecture du fichier CSV.");
        });
    });
  } catch (error) {
    console.error("Erreur lors de l'importation des données CSV :", error);
    throw new Error(
      "Une erreur est survenue lors de l'importation des données CSV."
    );
  }
}
export async function insertData(req, res) {
  try {
    const newRowData = req.body;
    const newRow = new ColumnData(newRowData);
    await newRow.save();
    const csvRow = Object.values(newRowData).join(";") + "\n";
    fs.appendFile("uploads/MotsCles.csv", csvRow, (err) => {
      if (err) {
        console.error("Erreur lors de l'écriture dans le fichier CSV :", err);
        return res.status(500).json({
          message:
            "Une erreur est survenue lors de l'insertion de la nouvelle ligne.",
        });
      }
      console.log("Nouvelle ligne ajoutée au fichier CSV.");
      res.status(201).json({ message: "Nouvelle ligne ajoutée avec succès." });
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'insertion de la nouvelle ligne de données :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de l'insertion de la nouvelle ligne.",
    });
  }
  await importStatiqueData("uploads/MotsCles.csv");
}
export async function deleteCsvData(req, res) {
  try {
    const { rowIndex, columnIndex } = req.body;
    const csvPath = "uploads/MotsCles.csv";

    let csvContent = fs.readFileSync(csvPath, "utf-8");
    let lines = csvContent.split("\n");

    let columns = lines[rowIndex].split(";");
    columns.splice(columnIndex, 1);
    lines[rowIndex] = columns.join(";");

    fs.writeFileSync(csvPath, lines.join("\n"));

    let document = await ColumnData.findOne();
    let rowData = document.contenu[rowIndex].split(";");
    rowData.splice(columnIndex, 1);
    document.contenu[rowIndex] = rowData.join(";");

    await document.save();
    res.status(200).json({
      message:
        "Cellule supprimée avec succès dans le fichier CSV et la base de données.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression de la cellule du fichier CSV et de la base de données :",
      error
    );
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de la cellule.",
    });
  }
}
export async function updateCsvData(req, res) {
  try {
    const { rowIndex, columnIndex, newValue } = req.body;
    const csvPath = "uploads/MotsCles.csv";

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n");

    const columns = lines[rowIndex].split(";");
    columns[columnIndex] = newValue;
    lines[rowIndex] = columns.join(";");
    fs.writeFileSync(csvPath, lines.join("\n"));

    const document = await ColumnData.findOne();
    if (document) {
      console.log("Type de document.contenu:", typeof document.contenu);
      console.log("Valeur de document.contenu:", document.contenu);

      if (Array.isArray(document.contenu)) {
        document.contenu[rowIndex] = columns.join(";");
        await document.save();

        // await importpatternsDatas();

        return res.status(200).json({
          message:
            "Cellule mise à jour avec succès dans le fichier CSV et la base de données.",
        });
      } else {
        throw new Error(
          "La propriété 'contenu' de l'objet document n'est pas un tableau de chaînes de caractères."
        );
      }
    } else {
      throw new Error("Aucun document trouvé dans la base de données.");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la cellule du fichier CSV et de la base de données :",
      error
    );
    return res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la cellule.",
      error: error.message,
    });
  }
}

export async function updateCsvDataColonne(req, res) {
  try {
    const { newColumn } = req.body;
    const csvPath = "uploads/MotsCles.csv";

    let csvContent = fs.readFileSync(csvPath, "utf-8");

    let lines = csvContent.split("\n");

    const newTitle = lines[0] + ";" + newColumn;

    for (let i = 0; i < lines.length; i++) {
      lines[i] += ";";
    }

    const newCsvContent = lines.join("\n");

    fs.writeFileSync(csvPath, newCsvContent);

    const document = await ColumnData.findOne();
    document.titre = newTitle;
    await document.save();

    res.status(200).json({
      message:
        "Nouvelle colonne ajoutée avec succès dans le fichier CSV et la base de données.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout de la nouvelle colonne dans le fichier CSV et la base de données :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur est survenue lors de l'ajout de la nouvelle colonne.",
    });
  }
}
