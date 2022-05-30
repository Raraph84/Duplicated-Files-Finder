const { default: Collection } = require("@discordjs/collection");
const Fs = require("fs");

const totalFiles = new Collection();

const checkDir = (dir) => {

    Fs.readdir(dir, (error, files) => files.forEach((file) => {

        Fs.lstat(dir + "/" + file, (error, stat) => {

            if (stat.isDirectory()) checkDir(dir + "/" + file);
            else Fs.readFile(dir + "/" + file, (error, buffer) => {
                const copy = totalFiles.findKey((val) => val.equals(buffer));
                if (copy) console.log(dir + "/" + file + " is a copy of " + copy);
                totalFiles.set(dir + "/" + file, buffer);
            });
        });
    }));
}

checkDir(__dirname + "/test-files");
