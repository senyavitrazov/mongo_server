const { User } = require('../../models/user');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const UserDto = require('../dto/user-dto');
const ApiError = require('../../exceptions/api-error');

class AccountService {
  async registration(credentials) {
    const candidate = await User.findOne({
      "credentials.login": credentials.login,
    });
    if (candidate) {
      throw ApiError.BadRequest(
        `A user with this username (${credentials.login}) already exists`
      );
    }
    const hashedPassword = await bcrypt.hash(
      credentials.password,
      await bcrypt.genSalt(10)
    );
    const user = await User.create({
      credentials: {
        login: credentials.login,
        hash_of_password: hashedPassword,
      },
    });
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(credentials) {
    const user = await User.findOne({
      "credentials.login": credentials.login,
    });
    if (!user) {
      throw ApiError.BadRequest("There are no use with such login");
    }
    const isPassEquals = await bcrypt.compare(
      credentials.password,
      user.credentials.hash_of_password
    );
    if (!isPassEquals) {
      throw ApiError.BadRequest("Uncorrect password");
    }
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

module.exports = new AccountService();
