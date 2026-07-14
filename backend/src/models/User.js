import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
        type: String,
        enum: ['customer', 'organiser', 'admin'],
        default: 'customer',
        required: true
    },
    createdAt: { type: Date, default: Date.now }
});
// Hash password before saving — only if password modified (avoid re-hashing on other updates)
UserSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// Instance method to check password on login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map