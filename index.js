const { promises: fs, createReadStream } = require("fs");
const { join, resolve, normalize } = require("path");
const { createHash } = require("crypto");
const config = require("./config.json");

const totalFiles = [];

const checkDir = async (dir) => {

    if (config.excludeDirs.some((excludeDir) => dir.endsWith(normalize(excludeDir))))
        return;

    const files = await fs.readdir(dir);

    for (const file of files) {

        if (config.excludeExtensions.includes(file.split(".").length > 1 ? file.split(".").pop().toLowerCase() : "dir"))
            continue;

        const filePath = join(dir, file);

        let stat;
        try {
            stat = await fs.lstat(filePath);
        } catch (error) {
            console.log("Cannot access " + filePath + " - " + error);
            continue;
        }

        if (stat.isDirectory()) {
            await checkDir(filePath);
            continue;
        }

        const hash = await new Promise((resolve, reject) => {
            const hash = createHash("md5");
            const stream = createReadStream(filePath);
            stream.on("data", (data) => hash.update(data));
            stream.on("end", () => resolve(hash.digest("hex")));
            stream.on("error", reject);
        });

        const copy = totalFiles.find((file) => file.hash === hash);
        if (copy) {
            console.log(filePath + " is a copy of " + copy.path);
            if (config.delete) await fs.unlink(filePath);
        } else
            totalFiles.push({ path: filePath, hash });
    }
}

checkDir(resolve(config.path));
