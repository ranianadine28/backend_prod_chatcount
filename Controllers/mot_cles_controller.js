import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import ColumnData from "../Models/mot_clets.js";
import path from "path";
import { createObjectCsvWriter } from 'csv-writer';

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

    const filePath = 'exports/exportedData.csv';

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: csvData.titre.split(';').map(column => ({ id: column, title: column })),
    });

    await csvWriter.writeRecords(csvData.contenu.map(row => {
      const rowData = {};
      row.split(';').forEach((value, index) => {
        rowData[csvData.titre.split(';')[index]] = value;
      });
      return rowData;
    }));

    res.download(filePath, 'exportedData.csv', (err) => {
      if (err) {
        console.error("Error sending CSV file:", err);
        res.status(500).json({ message: "Erreur lors de l'envoi du fichier CSV" });
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
    res.status(500).json({ message: "Erreur lors de l'exportation des données CSV" });
  }
}


export async function importCSVData(req, res) {
  const fileName = req.body.fileName;
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
      } catch (err) {
        console.error("Error inserting column data:", err);
      } finally {
        mongoose.connection.close();
      }
    });
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
    res.status(500).json({ message: "Erreur lors de la récupération des données CSV" });
  }
}

export async function insertData(req, res) {
  try {
    const newRowData = req.body;
    const newRow = new ColumnData(newRowData);
    await newRow.save();
    await importCSVData();

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
    await importCSVData();
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
    let csvContent = await fs.promises.readFile(csvPath, "utf-8");
    let lines = csvContent.split("\n");

    if (rowIndex < 0 || rowIndex >= lines.length) {
      throw new Error("L'index de ligne est invalide.");
    }

    let columns = lines[rowIndex].split(";");
    if (columnIndex < 0 || columnIndex >= columns.length) {
      throw new Error("L'index de colonne est invalide.");
    }

    if (typeof columns === "string") {
      columns = columns.split(";");
    }

    columns[columnIndex] = newValue;
    lines[rowIndex] = columns.join(";");

    await fs.promises.writeFile(csvPath, lines.join("\n"));

    const document = await ColumnData.findOne();
    if (!document) {
      throw new Error("Aucun document trouvé dans la base de données.");
    }

    if (!Array.isArray(document.contenu)) {
      throw new Error(
        "Le contenu du document n'est pas sous la forme attendue."
      );
    }

    document.contenu[rowIndex][columnIndex] = newValue;
    await document.save();

    return res.status(200).json({
      message:
        "Cellule mise à jour avec succès dans le fichier CSV et la base de données.",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la cellule :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la cellule.",
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
