const { exec } = require("child_process");

exec("sh ./test.sh", (err, stdout, stderr) => {
  console.log(stdout);
});