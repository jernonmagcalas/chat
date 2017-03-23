import { App, Tag, AccessLevel, User, UserTag } from 'app/models';
export async function seed() {
  let apps = await App.connection().query(query => {
    query.select('apps.*');
    query.leftJoin('tags', 'tags.app_id', 'apps.id');
    query.whereNull('tags.id');
  }).get();

  await apps.forEachAsync(async app => {
    // create a new tag
    let tag = new Tag();
    tag.name = 'General';
    tag.appId = app.getId();
    await tag.save();

    // get the admin
    let accessLevel = await AccessLevel.connection().findOne({ app_id: app.getId(), type: AccessLevel.OWNER });
    let admin = await User.connection().query(query => {
      query.select('users.*');
      query.innerJoin('user_apps', 'user_apps.user_id', 'users.id');

      query.where({ access_level_id: accessLevel.getId() });
    }).getOne();

    // assign the admin in the tag
    let userTag = new UserTag();
    userTag.appId = app.getId();
    userTag.userId = admin.getId();
    userTag.tagId = tag.getId();
    await userTag.save();
  });
}
