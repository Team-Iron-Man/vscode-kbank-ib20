
const util = require('util');
const crypto = require('crypto');



//MD5, SHA-1, HAS-180, SHA-256, SHA-512 : hash algorithm
//createHash() : 사용할 알고리즘
//update() : 암호화할 비밀번호
//digest() : 인코딩 방식


let has = crypto.createHash('md5').update('20160307').digest("hex");
console.log(has);

const createHashedPassword = (password: string) => {
    return crypto.createHash("sha512").update(password).digest("base64");
};
  
console.log(createHashedPassword("1234"));
console.log(createHashedPassword("1234"));
console.log(createHashedPassword("1234"));

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

const createSalt = async () => {
    const buf = await randomBytesPromise(64);
    return buf.toString("base64");
  };

  export const createHashedPassword2 = async (password: any) => {
    const salt = await createSalt();
    const key = await pbkdf2Promise(password, salt, 104906, 64, "sha512"); //해싱할 값, salt, 해시 함수 반복 횟수, 해시 값 길이, 해시 알고리즘
    const hashedPassword = key.toString("base64");
  
    return { hashedPassword, salt };
  };

  //비밀번호 검증
  //password : 로그인 인증할 때의 사용자가 입력한 비밀번호
  //userSalt : DB에 저장되어있는 사용자의 salt
  //userPassword : DB에 저장되어있는 사용자의 암호화된 비밀번호(해시 값)

  export const verifyPassword = async (password: any, userSalt: any, userPassword: any) => {
    const key = await pbkdf2Promise(password, userSalt, 99999, 64, "sha512");
    const hashedPassword = key.toString("base64");
  
    if (hashedPassword === userPassword) {return true;}
    return false;
  };
  


//   passport.use(
//     new LocalStrategy(
//       {
//         session: true, // 세션 저장 여부
//         usernameField: "id", // form > input name
//         passwordField: "password",
//       },
//       async (id, password, done) => {
//         try {
//           // 회원정보 조회
//           const user = await User.findOne({
//             where: {
//               email: id,
//             },
//             raw: true,
//           });
  
//           // 회원정보가 없는 경우
//           if (!user) {
//             done(null, false, {
//               message: "존재하지 않는 아이디입니다.",
//             });
//           }
  
//           const verified = await verifyPassword(
//             password,
//             user.salt,
//             user.password
//           );
//           // 비밀번호가 일치하지 않는 경우
//           if (!verified) {
//             done(null, false, {
//               message: "비밀번호가 일치하지 않습니다.",
//             });
//           }
//           done(null, user); // serializeUser로 user 전달
//         } catch {
//           done(null, false, {
//             message: "서버의 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
//           });
//         }
//       }
//     )
//   );
  
  
  
  