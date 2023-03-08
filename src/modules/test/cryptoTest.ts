const crypto = require("crypto"); //Bcrypt


export function showInputBox(input: string){
    let mdValue: String = crypto.createHash('md5').update(input).digest("hex");
    console.log(`입력비밀번호:`+ mdValue.toUpperCase());
}

showInputBox('20160377');