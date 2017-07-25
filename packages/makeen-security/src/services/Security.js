/* eslint-disable class-methods-use-this */
import Joi from 'joi';
import { ServiceContainer, decorators } from 'octobus.js';

const { service, withSchema } = decorators;

class Security extends ServiceContainer {
  @service()
  @withSchema({
    userId: Joi.object().required(),
    permissions: Joi.array().items(Joi.string()).required(),
  })
  async setUserPermissions({ userId, permissions }, { extract }) {
    const UserRepository = extract('UserRepository');
    const user = await UserRepository.findOne({
      query: {
        userId,
      },
    });

    if (user) {
      await UserRepository.updateOne({
        query: {
          userId,
        },
        update: {
          permissions,
        },
      });
    } else {
      await UserRepository.insertOne({
        query: {
          userId,
          permissions,
        },
      });
    }
  }

  @service()
  @withSchema({
    userId: Joi.object().required(),
  })
  async getUserPermissions({ userId }, { extract }) {
    const UserRepository = extract('UserRepository');
    const GroupRepository = extract('UserRepository');
    const user = await UserRepository.findOne({
      query: {
        userId,
      },
    });

    let groupsPermissions = [];

    if (user.groupIds.length) {
      const groups = await GroupRepository.findMany({
        query: {
          _id: {
            $in: user.groupIds,
          },
        },
      });

      groupsPermissions = groups.reduce(
        (acc, group) => [...acc, ...group.permissions],
        [],
      );
    }

    return [...user.permissions, ...groupsPermissions];
  }

  @service()
  setUserGroups() {}

  @service()
  getUserGroups() {}
}

export default Security;
