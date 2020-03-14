import moment from 'moment';

import { UploaderService } from '../../uploads/services';

export default class EventService {
  constructor(injection) {
    Object.assign(this, injection);
  }

  validateEventDetails(eventDetails) {
    const { startDate, endDate } = eventDetails;
    const title = eventDetails.title.trim();
    const description = eventDetails.description.trim();
    //Checks that the endDate is not earlier than the startDate
    if (moment(endDate).diff(moment(startDate)) <= 0) {
      throw new Error('startDate-after-endDate');
    }

    return {
      ...eventDetails,
      title,
      description,
    };
  }

  async uploadEventPhoto(uploadPhoto) {
    return await UploaderService.upload(uploadPhoto, null);
  }

  async createEvent(organiserId, eventDetails) {
    const { db } = this;
    const details = this.validateEventDetails(eventDetails);

    if (details.uploadPhoto) {
      const photoId = await this.uploadEventPhoto(details.uploadPhoto.originFileObj);
      delete details.uploadPhoto;
      details.photoId = photoId;
    }

    const eventId = db.events.insert({
      organiserId,
      ...details,
    });

    return eventId;
  }

  joinEvent(userId, eventId) {
    const { db } = this;

    const event = db.event.findOne(eventId);
    if (!event) {
      throw new Error('Something went wrong');
    }

    const user = event.usersId.find(userId);
    if (user) {
      throw new Error('user-alreadyJoined');
    }

    return db.events.update(eventId, {
      $push: {
        usersId: userId,
      },
    });
  }

  leaveEvent(userId, eventId) {
    const { db } = this;

    const event = db.event.findOne(eventId);
    if (!event) {
      throw new Error('Something went wrong');
    }

    const user = event.usersId.find(userId);
    if (!user) {
      throw new Error('user-notJoined');
    }

    const newUsersId = event.usersId.filter(u => u !== userId);

    return db.events.update(eventId, {
      $set: {
        usersId: newUsersId,
      },
    });
  }

  getUserEvents(userId) {
    const { db } = this;

    const events = db.events
      .find({
        usersId: {
          $in: [userId],
        },
      })
      .fetch();

    return events;
  }
}
