// service to run the python script with child_process.spawn 

const { spawn } = require("child_process");
const path = require("path");

function runPythonScript(videoPath) {

  return new Promise((resolve, reject) => {

    const scriptPath = path.join(
      __dirname,
      "..",
      "main.py"
    );

    const python = spawn(
      "python",
      [scriptPath, videoPath]
    );

    python.stdout.on("data", (data) => {
      console.log(
        "PYTHON:",
        data.toString()
      );
    });

    python.stderr.on("data", (data) => {
      console.error(
        "PYTHON ERROR:",
        data.toString()
      );
    });

    python.on("close", (code) => {

      if (code === 0) {

        console.log(
          "Python terminé"
        );

        resolve();

      } 
      
      else {

        reject(
          new Error(
            `Python exited with code ${code}`
          )
        );

      }

    });

  });

}

module.exports = runPythonScript;