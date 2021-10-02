const mongoose = require('mongoose');
const { mongo, env, admin } = require('./config/config');
const User = require('./models/user.model');

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.log(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

exports.connect = () => {
  mongoose
    .connect(mongo.uri, {
      useCreateIndex: true,
      keepAlive: 1,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(async () => {
      if ((await User.count({ role: 'admin' })) == 0) {
        const user = new User({
          name: "Admin",
          email: admin.email,
          password: admin.password,
          role: "admin",
          isVerified: true
        });
        await user.save();
      }
    });
  return mongoose.connection;
};
