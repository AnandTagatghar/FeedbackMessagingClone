const currentTime = new Date();
const verifyCodeExpiry = new Date(currentTime.setHours(currentTime.getHours() + 1));
const verifyCode = (Math.floor(Math.random() * 899999) + 100000).toString();

export default { verifyCode, verifyCodeExpiry };
