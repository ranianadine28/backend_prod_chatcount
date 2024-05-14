import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import patternModel from "../Models/patterns.js";

export async function importpatternsDatas(req, res) {
  const csvFilePath = "uploads/similarity.csv";
  const columns = {};

  await patternModel.deleteMany({});

  let rowCount = 0;

  fs.createReadStream(csvFilePath)
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
          columns[key].contenu.push(row[key]);
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
      if (typeof document.contenu === 'string') {
        let contenuArray = document.contenu.split(";");
        contenuArray[rowIndex * document.contenu.length + columnIndex] = newValue;
        document.contenu = contenuArray.join(";");
        await document.save();
        await importpatternsDatas();

        return res.status(200).json({
          message: "Cellule mise à jour avec succès dans le fichier CSV et la base de données."
        });
      } else {
        throw new Error("La propriété 'contenu' de l'objet document n'est pas une chaîne de caractères.");
      }
    } else {
      throw new Error("Aucun document trouvé dans la base de données.");
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la cellule du fichier CSV et de la base de données :", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la cellule."
    });
  }
}
