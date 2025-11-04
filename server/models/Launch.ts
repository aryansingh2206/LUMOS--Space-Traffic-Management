import mongoose, { Schema, model, type InferSchemaType, type Model } from "mongoose";
const { models } = mongoose;

/**
 * Launch schema (mission/vehicle/agency + windowOpen/windowClose)
 */
const LaunchSchema = new Schema(
  {
    // Optional legacy numeric id (if you previously stored one)
    id: { type: Number, index: true, sparse: true },

    mission: { type: String, required: true, trim: true },
    vehicle: { type: String, required: true, trim: true }, // e.g., Falcon 9
    agency: { type: String, required: true, trim: true },  // e.g., SpaceX/ISRO/ESA
    site:   { type: String, required: true, trim: true },  // launch site

    windowOpen: { type: Date, required: true }, // launch window start
    windowClose:{ type: Date, required: true }, // launch window end

    status: {
      type: String,
      enum: ["scheduled", "hold", "scrubbed", "launched", "aborted"],
      default: "scheduled",
      index: true,
    },

    notes: { type: String, trim: true },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Helpful indexes
LaunchSchema.index({ windowOpen: 1 });
LaunchSchema.index({ status: 1, windowOpen: 1 });

export type Launch = InferSchemaType<typeof LaunchSchema>;

// ✅ Correct typing: use Model<Launch>, not ReturnType<typeof model>
export const LaunchModel: Model<Launch> =
  (models.Launch as Model<Launch>) || model<Launch>("Launch", LaunchSchema);
