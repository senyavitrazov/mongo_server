module.exports = class UserDto {
  credentials = {};
  id;
  role;

  constructor (model) {
    this.credentials.login = model.credentials.login;
    this.id = model._id;
    this.role = model.role;
  }
};
