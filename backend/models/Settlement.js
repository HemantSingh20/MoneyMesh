import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Settled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Settlement = mongoose.model('Settlement', settlementSchema);
export default Settlement;
