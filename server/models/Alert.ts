import mongoose, { Schema, model, type InferSchemaType, type Model } from "mongoose";
const { models } = mongoose;

const AlertSchema = new Schema(
  {
    aSatId: { type: Schema.Types.ObjectId, ref: "Satellite", index: true, required: true },
    bSatId: { type: Schema.Types.ObjectId, ref: "Satellite", index: true, required: true },

    // snapshot values for quick UI (optional, but handy)
    aName: String,
    bName: String,

    // km
    missKm: { type: Number, required: true },
    // when we detected/updated this alert
    tca: { type: Date, required: true },

    level: { type: String, enum: ["info", "watch", "warning", "critical"], required: true },

    // lifecycle
    acknowledged: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },

    // de-dupe key: "<aId>__<bId>" sorted by id
    pairKey: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export type Alert = InferSchemaType<typeof AlertSchema>;
export const AlertModel: Model<Alert> =
  (models.Alert as Model<Alert>) || model<Alert>("Alert", AlertSchema);
