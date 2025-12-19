const fs = require('fs');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

(async () => {
  try {
    const email = await ask('ایمیل مدیر: ');
    const password = await ask('رمز عبور مدیر: ');

    const hash = await bcrypt.hash(password, 10);

    const adminData = {
      email,
      passwordHash: hash
    };

    const filePath = path.join(__dirname, 'admin.json');

    // اگر فایل وجود داشت، جایگزین کن
    fs.writeFileSync(filePath, JSON.stringify(adminData, null, 2));

    console.log('✅ فایل admin.json ساخته/بروزرسانی شد:');
    console.log(adminData);

  } catch (err) {
    console.error('خطا:', err);
  } finally {
    rl.close();
  }
})();
