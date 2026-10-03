import mongoose from "mongoose";
import { UnauthorizedError } from "../../errors/UnauthorizedError.js";
import { NotFoundError } from "../../errors/NotFoundError.js";

export class WishlistService {
  constructor(userRepository, hackathonRepository, logger) {
    this.userRepository = userRepository;
    this.hackathonRepository = hackathonRepository;
    this.logger = logger;
  }

  async toggleHackathonWishlist(userId, hackathonId) {
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
      throw new NotFoundError("Invalid event id");
    }

    const hackathonExists = await this.hackathonRepository.existsPublic(
      hackathonId
    );

    if (!hackathonExists) {
      throw new NotFoundError("Event not found");
    }

    const user = await this.userRepository.getWishlistIds(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const alreadyLiked = user.wishlist.some(
      (id) => id.toString() === hackathonId
    );

    if (alreadyLiked) {
      await this.userRepository.removeFromWishlist(userId, hackathonId);

      this.logger?.info(
        {
          userId,
          hackathonId,
        },
        "Event removed from wishlist"
      );

      return {
        liked: false,
        message: "Removed from wishlist",
      };
    }

    await this.userRepository.addToWishlist(userId, hackathonId);

    this.logger?.info(
      {
        userId,
        hackathonId,
      },
      "Event added to wishlist"
    );

    return {
      liked: true,
      message: "Added to wishlist",
    };
  }

  async getUserWishlist(userId) {
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await this.userRepository.getWishlist(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const likedHackathons = user.wishlist.filter((hackathon) => hackathon);

    return {
      likedHackathons,
      count: likedHackathons.length,
    };
  }

  async checkHackathonLiked(userId, hackathonId) {
    if (!userId) {
      throw new UnauthorizedError("User not authenticated");
    }

    const user = await this.userRepository.getWishlistIds(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const liked = user.wishlist.some((id) => id.toString() === hackathonId);

    return { liked };
  }
}
