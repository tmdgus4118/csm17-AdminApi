const express = require("express");

const adminController = require("../controllers/authController");

const { adminTokenRequired } = require("../utils/auth");
const authrouter = express.Router();

authrouter.post("/admin/signin", adminController.adminSignIn); //관리자 로그인기능
authrouter.post("/admin/signup", adminController.adminSignUp); //관리가 회원가입기능
authrouter.get("/admin/users", adminTokenRequired, adminController.getAllUser); // 모든 유저 불러오기
authrouter.get(
  "/admin/dashboard",
  adminTokenRequired,
  adminController.getDashboard
); // 대시보드 화면(다양한 정보 불러오기)
authrouter.post(
  "/admin/posting",
  adminTokenRequired,
  adminController.adminPosting
); //게시물 등록

authrouter.post("/pay/complete", adminController.postPayments);
//아임포트 결제 모듈 테스트

authrouter.get(
  "/admin/userstatus",
  adminTokenRequired,
  adminController.getUserInforByNickName
);

authrouter.delete(
  "/admin/userstatus/:userId",
  adminTokenRequired,
  adminController.deleteByUserId
);

module.exports = authrouter;
