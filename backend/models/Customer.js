import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    nic: {
      type: String,
      required: [true, 'National Identity Card (NIC) is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [0, 'Loan amount cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'settled', 'defaulted'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;
