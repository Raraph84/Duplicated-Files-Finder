const { default: Collection } = require("@discordjs/collection");
const Fs = require("fs");
const Config = require("./config.json");

const totalFiles = new Collection();

const checkDir = (dir) => {

    Fs.readdir(dir, (error, files) => files.forEach((file) => {

        if (error) console.log(error);

        if (Config.excludeExtensions.includes(file.split(".").length > 1 ? file.split(".").pop().toLowerCase() : "dir"))
            return;

        Fs.lstat(dir + "/" + file, (error, stat) => {

            if (error) console.log(error);

            if (stat.isDirectory()) checkDir(dir + "/" + file);
            else Fs.readFile(dir + "/" + file, (error, buffer) => {

                if (error) console.log(error);

                const copy = totalFiles.findKey((val) => val.equals(buffer));
                if (copy) {
                    console.log(dir + "/" + file + " is a copy of " + copy);
                    if (Config.delete) {
                        Fs.unlink(dir + "/" + file, (error) => {
                            if (error) console.log(error);
                        });
                    }
                } else
                    totalFiles.set(dir + "/" + file, buffer);
            });
        });
    }));
}

checkDir(Config.path);
