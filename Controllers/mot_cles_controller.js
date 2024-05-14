import fs from "fs";
import csvParser from "csv-parser";
import mongoose from "mongoose";
import ColumnData from "../Models/mot_clets.js";
export async function importCSVData() {
  const columns = {};
  await ColumnData.deleteMany({});
  fs.createReadStream("uploads/MotsCles.csv")
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
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des données CSV" });
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
}export async function updateCsvData(req, res) {
  try {
    const { indexLigne, indexColonne, newValue } = req.body;
    const document = await ColumnData.findOne();

    if (!document) {
        console.error("Document non trouvé");
        return res.status(404).json({ message: "Document non trouvé" });
    }

    // Vérifie si l'index de ligne est valide
    if (indexLigne < 0 || indexLigne >= document.contenu.length) {
        console.error("Index de ligne invalide");
        return res.status(400).json({ message: "Index de ligne invalide" });
    }

    // Vérifie si la ligne spécifiée existe dans le tableau contenu
    if (!document.contenu[indexLigne]) {
        console.error("Ligne non trouvée");
        return res.status(400).json({ message: "Ligne non trouvée" });
    }

    // Vérifie si l'index de colonne est valide
    if (indexColonne < 0 || indexColonne >= document.contenu[indexLigne].length) {
        console.error("Index de colonne invalide");
        return res.status(400).json({ message: "Index de colonne invalide" });
    }

    console.log("Index de ligne:", indexLigne);
    console.log("Nombre de lignes dans le document:", document.contenu.length);
    console.log("Contenu de la ligne spécifiée:", document.contenu[indexLigne]);
        document.contenu[indexLigne][indexColonne] = newValue;

    // Sauvegarde du document mis à jour
    await document.save();
    console.log("Document mis à jour avec succès !");
    return res.status(200).json({
        message: "Cellule mise à jour avec succès dans le fichier CSV et la base de données.",
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
