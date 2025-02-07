import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const productSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        images: [{
            type: String,
            required: true,
        }],
        brand: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        fabric: {
            type: String,
            required: false,
        },
        careInstructions: {
            type: String,
            required: false,
        },
        modelMeasurements: {
            type: String,
            required: false,
        },
        productDetails: {
            type: String,
            required: false,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        discount: {
            type: {
                type: String,
                enum: ['percentage', 'fixed'],
                default: 'percentage'
            },
            amount: {
                type: Number,
                default: 0
            },
            startDate: {
                type: Date
            },
            endDate: {
                type: Date
            },
            isActive: {
                type: Boolean,
                default: false
            }
        },
        discountedPrice: {
            type: Number,
            default: function () {
                if (!this.discount || !this.discount.isActive) return this.price;
                if (this.discount.type === 'percentage') {
                    return this.price * (1 - this.discount.amount / 100);
                }
                return Math.max(this.price - this.discount.amount, 0);
            }
        },
        sizes: {
            type: [String],
            required: [true, 'En az bir beden seçimi zorunludur'],
            enum: {
                values: ['32', '34', '36', '38', '40', '42', '44', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
                message: 'Geçersiz beden seçimi'
            }
        },
        sizeStock: {
            type: Map,
            of: Number,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const Product = mongoose.model('Product', productSchema);
export default Product; 