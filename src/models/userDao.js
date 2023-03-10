const { json } = require("body-parser");
const mongoose = require("mongoose");
// require("mongoose-moment")(mongoose);
moment = require("moment");
const fetch = require("node-fetch");
const { logger } = require("../../config/winston");
const fs = require("fs");

const { useContainer, TreeRepository, Db } = require("typeorm");
const { userTokenRequired, adminTokenRequired } = require("../utils/auth");
const {
  AdminSchema,
  UserSchema,
  PostsSchema,
  PdfSchema,
  DataRoomSchema,
  PaymentsSchema,
  SchoolSchema,
  ExamFileSchema,
} = require("../utils/schema");

const User = new mongoose.model("Users", UserSchema);
const Admin = new mongoose.model("Admin", AdminSchema);
const Post = new mongoose.model("Post", PostsSchema);
const Pdfs = new mongoose.model("pdf", PdfSchema);
const DataRoom = new mongoose.model("DataRoom", DataRoomSchema);
const Payments = new mongoose.model("Payments", PaymentsSchema);
const School = new mongoose.model("School", SchoolSchema);
const Exam = new mongoose.model("Exam", ExamFileSchema);

const getAdminById = async (adminId) => {
  const { logger } = require("../../config/winston");
  try {
    const admins = await Admin.findOne({ adminId: adminId });
    // logger.info(`Admin Log In. AdminId:${adminId}`);
    return admins;
  } catch (err) {
    console.log(err);
  }
};

const getUserById = async (userEmail) => {
  const { logger } = require("../../config/winston");
  try {
    const users = await User.findOne({ email: userEmail });
    // logger.info(`User LogIn . UserEmail: ${userEmail}`);
    return users;
  } catch (err) {
    console.log(err);
  }
};

const getUserByIdd = async (id) => {
  try {
    const users = await User.findOne({ _id: id });
    return users;
  } catch (err) {
    console.log(err);
  }
};

const getUserByNickName = async (nickname) => {
  try {
    const users = await User.findOne({ nickname: nickname });
    return users;
  } catch (err) {
    console.log(err);
  }
};

const createAdmin = async (adminId, password) => {
  try {
    const admins = await Admin.create({
      adminId: adminId,
      password: password,
    });
    console.log("Success to Create Admin!!");
    return admins;
  } catch (err) {
    console.log(err);
  }
};

const createUser = async (email, nickname, password) => {
  try {
    const users = await User.create({
      email: email,
      nickname: nickname,
      password: password,
      status: 1,
    });
    console.log("Success to Create User!!");
    return users;
  } catch (err) {
    console.log(err);
  }
};

const getAllUser = async () => {
  const { logger } = require("../../config/winston");
  logger.info(`Admin See all Users List!`);
  try {
    const AllUsers = await User.find({});
    return AllUsers;
  } catch (err) {
    console.log(err);
  }
};

const getDashboard = async () => {
  const { logger } = require("../../config/winston");
  logger.info(`Admin Visit DashBoard!`);
  try {
    console.log(
      "_____________________________START___________________________________"
    );
    const allAdmin = await Admin.count({
      register_time: { $lt: moment().format("YYYYMMDDhhmmss") },
    });
    const yesterdayAdmin = await Admin.count({
      register_time: { $lt: moment().format("YYYYMMDDhhmmss") - 1000000 },
    });

    if (allAdmin > yesterdayAdmin) {
      const increaseAdmin = allAdmin - yesterdayAdmin;
      console.log("???????????? ????????? ????????????:", increaseAdmin);
    } else if (allAdmin < yesterdayAdmin) {
      const decreaseAdmin = yesterdayAdmin - allAdmin;
      console.log("???????????? ????????? ????????????:", decreaseAdmin);
    } else {
      console.log("????????????");
    }
    console.log(" ?????? ??? ????????? ??????", allAdmin);
    console.log(
      "_____________________________AND_____________________________________"
    );
    const allPosts = await Post.count({
      register_time: { $lt: moment().format("YYYYMMDDhhmmss") },
    });
    const yesterdayPosts = await Post.count({
      register_time: { $lt: moment().format("YYYYMMDDhhmmss") - 1000000 },
    });
    if (allPosts > yesterdayPosts) {
      const increasePost = allPosts - yesterdayPosts;
      console.log("???????????? ????????? ????????? ??? :", increasePost);
    } else {
      console.log("?????? ??????");
    }
    console.log("?????? ??? ????????? ??????:", allPosts);
    console.log(
      "_____________________________AND_____________________________________"
    );

    const viewPosts = await Post.find({}).sort({ view: -1 }).limit(5);
    console.log("????????? ?????? 5??? ?????????:", viewPosts);

    console.log(
      "_____________________________AND_____________________________________"
    );

    const viewFiles = await Pdfs.find({}).sort({ _id: 1 }).limit(5);
    console.log("?????? ??????:", viewFiles);
    console.log(
      "_____________________________AND_____________________________________"
    );

    const viewDatas = await DataRoom.find({}).sort({ _id: 1 }).limit(8);
    console.log("?????????:", viewDatas);

    console.log(
      "______________________________END_____________________________________"
    );

    return { allPosts, allAdmin, viewPosts, viewFiles, viewDatas };

    //?????? ????????? ????????? ????????? ???????????? ?????? ????????????. ????????? DB??? ?????? ????????? ????????? ????????? ???????????? ????????? ???????????? ???????????? ??????????????? ?????????. ?????? ????????? ??????????????????.
  } catch (err) {
    console.log(err);
  }
};

const adminPosting = async (title, content, adminId) => {
  const { logger } = require("../../config/winston");

  try {
    const RandomViewNumber = Math.floor(Math.random() * 1000 + 1);
    const posts = await Post.create({
      title: title,
      content: content,
      adminId: adminId,
      view: RandomViewNumber,
    });
    logger.info(`Admin Posting title:${posts.title}`);
    console.log("Success to Posting!!");
    const allposts = await Post.count({});
    console.log(allposts);
    return posts;
  } catch (err) {
    console.log(err);
  }
};

const userPosting = async (title, content) => {
  const { logger } = require("../../config/winston");
  try {
    const RandomViewNumber = Math.floor(Math.random() * 1000 + 1);
    const writer = userTokenRequired._id;
    const posts = await Post.create({
      title: title,
      content: content,
      view: RandomViewNumber,
      userId: writer,
    });
    logger.info(`User Posting title:${title}. And Content: ${content}`);
    console.log("Success to Posting!!");
    return posts;
  } catch (err) {
    console.log(err);
  }
};

const postPayments = async (imp_uid, merchant_uid) => {
  try {
    const payments = await Payments.create({
      imp_uid: imp_uid,
      merchant_uid: merchant_uid,
    });
    console.log("Success to create Payments!!");
    const allPayments = await Payments.find({});
    console.log(allPayments);
    return payments;
  } catch (err) {
    console.log(err);
  }
};

const getUserInforByNickName = async (userNickName) => {
  const { logger } = require("../../config/winston");

  try {
    console.log("------------NEST PAGE!!------------");
    console.log("------------START------------");
    const regex = (pattern) => new RegExp(`.*${pattern}.*`);
    const titleRegex = regex(userNickName);
    const AlluserStatus = await User.find({ nickname: { $regex: titleRegex } });
    logger.info(`Admin get All users By Nick name and search${userNickName}`);
    console.log(AlluserStatus);
    console.log("------------AND------------");

    const countAllUsers = await User.count({});

    console.log("?????? ???????????? ??????:", countAllUsers);
    console.log("------------AND------------");

    const exitUsers = await User.count({ status: 0 });
    console.log("????????? ?????? ???:", exitUsers);

    return { AlluserStatus, countAllUsers, exitUsers };
  } catch (err) {
    console.log(err);
  }
};

const patchUserStatusById = async (userId, statusId) => {
  const { logger } = require("../../config/winston");
  const changestatusId = await User.update(
    { _id: userId },
    { $set: { status: statusId } }
  );
  logger.info(`Admin Change Status ${userId} to ${statusId}`);
  console.log("Success to Change user Status!!. UserId:", userId);
  return changestatusId;
};

const deleteByUserId = async (userId) => {
  const { logger } = require("../../config/winston");
  const deleteUser = await User.findByIdAndDelete(userId);
  logger.info(`Admin Delete UserId : ${userId}`);
  console.log("Delete to Success usernickname :", deleteUser.nickname);
  return deleteUser;
};

const getExam = async (examType) => {
  const { logger } = require("../../config/winston");
  try {
    console.log("-------------------?????? ??????------------------");
    const regex = (pattern) => new RegExp(`.*${pattern}.*`);
    const titleRegex = regex(examType);

    const AllExamFile = await Exam.find({ Type: { $regex: titleRegex } });
    console.log(AllExamFile);
    logger.info(`User Search "${examType}"`);
    return AllExamFile;
  } catch (err) {
    console.log(err);
  }
};

// const getSearchLog = async (searchLog) => {
//   const fs = require("fs");

//   fs.readFile("../../logs/2023-02-07.txt", "utf8", (err, data) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     try {
//       const count = data.match(/`${searchLog}`/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log(`${searchLog}:?????? ??????`, count);
//     } catch (err) {
//       console.log(`${searchLog}:?????? ??????:0`);
//     }

//     try {
//       const count = data.match(/??????/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("?????? ????????????:", count);
//     } catch (err) {
//       console.log("?????? ????????????:0");
//     }
//     try {
//       const count1 = data.match(/??????/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("?????? ????????????:", count1);
//     } catch (err) {
//       console.log("?????? ????????????:0");
//     }
//     try {
//       const count2 = data.match(/??????/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("?????? ????????????:", count2);
//     } catch (err) {
//       console.log("?????? ????????????:0");
//     }
//     try {
//       const count3 = data.match(/2???/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("2???????????? ????????????:", count3);
//     } catch (err) {
//       console.log("2???????????? ????????????:0");
//     }
//     try {
//       const count4 = data.match(/3???/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("3???????????? ????????????:", count4);
//     } catch (err) {
//       console.log("3???????????? ????????????:0");
//     }
//     try {
//       const count5 = data.match(/??????/g).filter(function (item) {
//         return item !== "";
//       }).length;
//       console.log("?????? ????????????:", count5);
//     } catch (err) {
//       console.log("?????? ????????????:0");
//     }
//   });
// };

module.exports = {
  getAdminById,
  getUserById,
  getUserByNickName,
  createAdmin,
  createUser,
  getAllUser,
  getDashboard,
  adminPosting,
  userPosting,
  postPayments,
  getUserInforByNickName,
  patchUserStatusById,
  deleteByUserId,
  getUserByIdd,
  getExam,
};
