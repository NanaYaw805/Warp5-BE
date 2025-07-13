import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
    identifier: { type: String, required: true, unique: true }, // email or phone
    password: { type: String, required: true },
    type: { type: String, enum: ['email', 'phone'], required: true }
});

const Auth = mongoose.model('Auth', authSchema);

export default Auth; 