import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' } // Référence à l'utilisateur
});

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;
