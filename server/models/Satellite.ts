import mongoose, { Schema, model, type InferSchemaType, type Model } from "mongoose";
const { models } = mongoose;

const PositionSchema = new Schema(
  {
    lat: { type: Number, default: 0 },
    lon: { type: Number, default: 0 },
    altKm:{ type: Number, default: 400 },
    lastUpdate: { type: Date, default: () => new Date() },
  },
  { _id: false }
);

const SatelliteSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    noradId: { type: Number, index: true, sparse: true },

    operator: { type: String, trim: true },
    country:  { type: String, trim: true },

    sourceLaunchId: { type: Schema.Types.ObjectId, ref: "Launch", index: true },

    status: {
      type: String,
      enum: ["active", "decayed", "unknown"],
      default: "active",
      index: true,
    },

    launchedFrom: { type: String, trim: true },
    rocketType:   { type: String, trim: true },
    liveSince:    { type: Date, default: () => new Date() },

    position: { type: PositionSchema, default: () => ({}) },
  },
  { timestamps: true }
);

SatelliteSchema.index({ status: 1, "position.lastUpdate": -1 });

export type Satellite = InferSchemaType<typeof SatelliteSchema>;

export const SatelliteModel: Model<Satellite> =
  (models.Satellite as Model<Satellite>) || model<Satellite>("Satellite", SatelliteSchema);
