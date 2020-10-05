import mongoose from 'mongoose'

const nChatSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
});

// collection
export default mongoose.model('messagecontents', nChatSchema)