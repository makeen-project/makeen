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
          $set: {
            permissions,
          },
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
    const GroupRepository = extract('GroupRepository');
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
  @withSchema({
    userId: Joi.object().required(),
    groups: Joi.array().items(Joi.string()).required(),
  })
  async setUserGroups({ userId, groups }, { extract }) {
    const UserRepository = extract('UserRepository');
    const GroupRepository = extract('GroupRepository');
    const user = await UserRepository.findOne({
      query: {
        userId,
      },
    });
    const fetchedGroups = await GroupRepository.findMany({
      query: {
        name: {
          $in: groups,
        },
      },
    });
    const groupIds = fetchedGroups.map(({ _id }) => _id);

    if (user) {
      await UserRepository.updateOne({
        query: {
          userId,
        },
        update: {
          $set: {
            groupIds,
          },
        },
      });
    } else {
      await UserRepository.insertOne({
        query: {
          userId,
          groupIds,
        },
      });
    }
  }
}

export default Security;
