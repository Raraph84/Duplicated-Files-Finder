const { promises: fs } = require("fs");
const { createHash } = require("crypto");
const Config = require("./config.json");

const totalFiles = [];

const checkDir = async (dir) => {

    const files = await fs.readdir(dir);

    for (const file of files) {

        if (Config.excludeExtensions.includes(file.split(".").length > 1 ? file.split(".").pop().toLowerCase() : "dir"))
            continue;

        const stat = await fs.lstat(dir + "/" + file);

        if (stat.isDirectory()) {
            await checkDir(dir + "/" + file);
            continue;
        }

        const buffer = await fs.readFile(dir + "/" + file);
        const hash = createHash("md5").update(buffer).digest("hex");

        const copy = totalFiles.find((file) => file.hash === hash);
        if (copy) {
            console.log(dir + "/" + file + " is a copy of " + copy.path);
            if (Config.delete) await fs.unlink(dir + "/" + file);
        } else
            totalFiles.push({ path: dir + "/" + file, hash });
    }
}

checkDir(Config.path);
