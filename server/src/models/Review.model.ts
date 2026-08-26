import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product ratings after save
reviewSchema.statics.calcAverageRatings = async function (
  productId: mongoose.Types.ObjectId
) {
  const Product = mongoose.model("Product");
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
      ratingsCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsCount: 0,
    });
  }
};

// After save
reviewSchema.post("save", function () {
  (this.constructor as any).calcAverageRatings(this.product);
});

// After remove
reviewSchema.post(
  "findOneAndDelete",
  function (doc: IReview | null) {
    if (doc) {
      (doc.constructor as any).calcAverageRatings(doc.product);
    }
  }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
