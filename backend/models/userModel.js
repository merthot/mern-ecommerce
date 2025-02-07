import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'İsim alanı zorunludur'],
        },
        email: {
            type: String,
            required: [true, 'E-posta alanı zorunludur'],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, 'Şifre alanı zorunludur'],
            minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
            match: [
                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
            ]
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        phone: {
            type: String,
            default: '',
        },
        addresses: [{
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            fullName: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                default: 'Türkiye',
            },
            isDefault: {
                type: Boolean,
                default: false,
            }
        }],
        favorites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Şifreyi hashleme
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Şifre sıfırlama token'ı oluştur
userSchema.methods.getResetPasswordToken = function () {
    // Token oluştur
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Token'ı hash'le ve modele kaydet
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token'ın geçerlilik süresini ayarla (30 dakika)
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User; 