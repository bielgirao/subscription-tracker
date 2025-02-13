import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription Name is Required'],
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    price: {
        type: Number,
        required: [true, 'Subscription Price is Required'],
        min: [0, 'Price must be greater than 0']
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'BRL'],
        default: 'BRL'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'gaming', 'lifestyle', 'technology', 'finance', 'health', 'streaming', 'music', 'cloud', 'software', 'other'],
        required: [true, 'Subscription Category is Required']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment Method is Required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: [true, 'Subscription Start Date is Required'],
        validate: {
            validator: (value) => value <= new Date(),
            message: 'Start Date must be in the past'
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startDate
            },
            message: 'Renewal Date must be after the Start Date'
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, { timestamps: true });

subscriptionSchema.pre('save', function (next) {

    // Auto-calculate the renewal date if it's missing
    if(!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        }
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Auto-update the status if renewal date has passed
    if(this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next();
})

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;