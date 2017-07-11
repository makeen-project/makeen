/* eslint-disable class-methods-use-this */
import Joi from 'joi';
import { ServiceContainer, decorators } from 'octobus.js';

const { service, withSchema } = decorators;

class ACL extends ServiceContainer {
  @service()
  @withSchema({
    subject: Joi.string().required(),
    resource: Joi.string().required(),
    permissions: Joi.array().items(Joi.string().required()).default([]),
  })
  async allow({ subject, resource, permissions }, { extract }) {
    const ACLRepository = extract('ACLRepository');
    const acl = await ACLRepository.findOne({ query: { subject, resource } });
    if (!acl) {
      return ACLRepository.createOne({ subject, resource, permissions });
    }

    return ACLRepository.updateOne({
      query: {
        _id: acl._id,
      },
      update: {
        $addToSet: {
          permissions,
        },
      },
    });
  }

  @service()
  @withSchema({
    subject: Joi.string().required(),
    resource: Joi.string().required(),
    permissions: Joi.alternatives().try(
      Joi.array().items(Joi.string().required()).default([]),
      Joi.string().required(),
    ),
  })
  async can({ subject, resource, permissions: rawPermissions }, { extract }) {
    const permissions = Array.isArray(rawPermissions)
      ? rawPermissions
      : [rawPermissions];
    const ACLRepository = extract('ACLRepository');
    const acl = await ACLRepository.findOne({ query: { subject, resource } });
    if (!acl) {
      return false;
    }

    return permissions.every(permission =>
      acl.permissions.includes(permission),
    );
  }
}

export default ACL;
