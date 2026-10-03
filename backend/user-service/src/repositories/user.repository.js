import UserModel from "../models/user.models.js";

export class UserRepository {
  async findByEmail(email) {
    return await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
  }

  async findByEmailWithPassword(email) {
    return await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
  }

  async findById(id) {
    return await UserModel.findById(id);
  }

  async create(userData) {
    const user = await UserModel.create(userData);
    return user;
  }

  async save(user) {
    return await user.save();
  }

  async updateById(id, updates) {
    return await UserModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  }

  async updateLastLogin(id) {
    return await UserModel.findByIdAndUpdate(
      id,
      {
        lastLogin: new Date(),
      },
      {
        new: true,
      }
    );
  }

  async addToWishlist(userId, hackathonId) {
    return await UserModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          wishlist: hackathonId,
        },
      },
      {
        new: true,
      }
    );
  }

  async removeFromWishlist(userId, hackathonId) {
    return await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          wishlist: hackathonId,
        },
      },
      {
        new: true,
      }
    );
  }

  async getWishlist(userId) {
    return await UserModel.findById(userId).populate("wishlist");
  }

  async markVerified(user) {
    user.isVerified = true;
    return await user.save();
  }

  async updatePassword(user, hashedPassword) {
    user.password = hashedPassword;
    return await user.save();
  }

  async findByIdWithRefreshHash(id) {
    return await UserModel.findById(id).select("+refreshTokenHash");
  }

  async setRefreshTokenHash(id, hash) {
    return await UserModel.findByIdAndUpdate(id, { refreshTokenHash: hash });
  }

  async clearRefreshTokenHash(id) {
    return await UserModel.findByIdAndUpdate(id, { refreshTokenHash: null });
  }
}

export default new UserRepository();