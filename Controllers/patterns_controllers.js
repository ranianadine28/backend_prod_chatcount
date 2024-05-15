import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import patternModel from "../Models/patterns.js";

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

    const filePath = "exports/exportedMotCles.csv";

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

export async function importpatternsDatas(req, res) {
  const fileName = req.body.fileName;

  let filePath;
  if (fileName) {
    filePath = "uploads/" + fileName;
  } else {
    filePath = "uploads/similarity.csv";
  }

  const columns = {};

  await patternModel.deleteMany({});

  let rowCount = 0;

  fs.createReadStream(filePath)
    .pipe(csvParser({ delimiter: ";" }))
    .on("data", (row) => {
      rowCount++;

      if (rowCount <= 1) return;

      if (rowCount === 2) {
        Object.keys(row).forEach((key) => {
          columns[key] = {
            titre: row[key],
            contenu: [],
          };
        });
      } else {
        Object.keys(row).forEach((key) => {
          if (columns[key]) {
            columns[key].contenu.push(row[key]);
          } else {
            console.error(`Column ${key} not found in header.`);
          }
        });
      }
    })
    .on("end", async () => {
      try {
        for (const [key, columnData] of Object.entries(columns)) {
          const column = new patternModel(columnData);
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

export async function getpatternsData(req, res) {
  try {
    const patternData = await patternModel.findOne();

    if (!patternData) {
      return res.status(404).json({ message: "Aucune donnée pattern trouvée" });
    }

    res.json(patternData);
  } catch (error) {
    console.error("Error fetching pattern data:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données pattern" });
  }
}

export async function insertPatternData(req, res) {
  try {
    const newRowData = req.body;
    const newRow = new patternModel(newRowData);
    await newRow.save();
    await importpatternsDatas();

    const nonEmptyValues = Object.values(newRowData).filter(
      (value) => value !== ""
    );
    const csvRow = nonEmptyValues.join(";") + "\n";

    fs.appendFile("uploads/similarity.csv", csvRow, (err) => {
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

export async function deletePatternData(req, res) {
  try {
    const { rowIndex, columnIndex } = req.body;
    const csvPath = "uploads/similarity.csv";

    let csvContent = fs.readFileSync(csvPath, "utf-8");
    let lines = csvContent.split("\n");

    let columns = lines[rowIndex].split(";");
    columns.splice(columnIndex, 1);
    lines[rowIndex] = columns.join(";");

    fs.writeFileSync(csvPath, lines.join("\n"));

    let document = await patternModel.findOne();
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
export async function updatePatternData(req, res) {
  try {
    const { rowIndex, columnIndex, newValue } = req.body;
    const csvPath = "uploads/similarity.csv";

    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n");

    const columns = lines[rowIndex].split(";");
    columns[columnIndex] = newValue;
    lines[rowIndex] = columns.join(";");

    fs.writeFileSync(csvPath, lines.join("\n"));

    const document = await patternModel.findOne();

    if (document) {
      if (typeof document.contenu === "string") {
        let contenuArray = document.contenu.split(";");
        contenuArray[rowIndex * document.contenu.length + columnIndex] =
          newValue;
        document.contenu = contenuArray.join(";");
        await document.save();
        await importpatternsDatas();

        return res.status(200).json({
          message:
            "Cellule mise à jour avec succès dans le fichier CSV et la base de données.",
        });
      } else {
        throw new Error(
          "La propriété 'contenu' de l'objet document n'est pas une chaîne de caractères."
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
    });
  }
}
