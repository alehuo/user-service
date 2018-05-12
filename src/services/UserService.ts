import * as Knex from "knex";
import ServiceError from "../utils/ServiceError";
import { generateHashWithPasswordAndSalt } from "./AuthenticationService";
import User from "../models/User";
import UserDao from "../dao/UserDao";

export default class UserService {
  constructor(private readonly userDao: UserDao) {}

  async fetchUser(userId: number) {
    let result = await this.userDao.findOne(userId);
    if (!result) {
      throw new ServiceError(404, "Not found");
    }

    return new User(result);
  }

  async fetchAllUsers(): Promise<User[]> {
    const results = await this.userDao.findAll();
    return results.map(dbObj => new User(dbObj));
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    let results = await this.userDao.findWhere(searchTerm);
    if (!results.length) {
      throw new ServiceError(404, "No results returned");
    }

    return results.map(res => new User(res));
  }

  async getUserWithUsernameAndPassword(username, password): Promise<User> {
    const dbUser = await this.userDao.findByUsername(username);
    if (!dbUser) {
      throw new ServiceError(404, "User not found");
    }

    const user = new User(dbUser);
    const hashedPassword = generateHashWithPasswordAndSalt(password, user.salt);
    if (hashedPassword === user.hashedPassword) {
      return user;
    }
    throw new ServiceError(400, "Passwords do not match");
  }

  /**
   * Checks if usernae is available.
   * @param username
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    return this.userDao.findByUsername(username).then(res => !res);
  }
}
