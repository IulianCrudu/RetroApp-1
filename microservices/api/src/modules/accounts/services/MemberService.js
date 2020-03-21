import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import { UserService } from './index';
import RolesEnum from '../db/users/enums/RolesEnum';

export default class MemberService {
  constructor(injection) {
    Object.assign(this, injection);
  }

  registerMember(input) {
    const { email, password } = input;
    UserService.validateEmail(email);

    const userId = Accounts.createUser({
      email,
      password,
    });
    Roles.addUsersToRoles(userId, RolesEnum.MEMBER);

    return true;
  }

  addMemberDetails({ email, details }) {
    const { db } = this;
    const user = Accounts.findUserByEmail(email);
    if (!user) {
      throw new Error('email-not-used');
    }

    const { _id: userId } = user;
    db.users.update(
      { _id: userId },
      {
        $set: {
          profile: {
            ...details,
          },
        },
      }
    );

    return true;
  }

  addMemberCategories(userId, categories) {
    const { db } = this;
    return db.users.update(userId, {
      $set: {
        'profile.categoryIds': [...categories],
      },
    });
  }

  loginMember(input) {
    const { db } = this;
    const { email, password } = input;

    const user = Accounts.findUserByEmail(email);

    if (!user) {
      throw new Error('Email not used');
    }

    // const user = db.users.findOne(userId);

    const userId = user._id;

    const response = Accounts._checkPassword(user, password);
    if (response.error) {
      throw new Error(response.errors);
    }

    Accounts._clearAllLoginTokens(userId);

    const stampedLoginToken = Accounts._generateStampedLoginToken();
    Accounts._insertLoginToken(userId, stampedLoginToken);

    const { token } = stampedLoginToken;

    return { token, userId };
  }
}
